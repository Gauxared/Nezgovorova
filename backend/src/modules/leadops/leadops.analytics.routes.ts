import { Router } from "express";
import { prisma } from "../../prisma/client.js";
import { requireAuth } from "../auth/auth.middleware.js";

export const leadopsAnalyticsRouter = Router();

leadopsAnalyticsRouter.get("/summary", requireAuth, async (_request, response) => {
  const [
    totalLeads,
    activeLeads,
    overdueActivities,
    leadsWithoutActivities,
    reportsSubmittedToday,
    reportsMissed,
    linkedClients,
    linkedProjects,
    linkedTasks,
    pipelineAmount,
    byStage,
    recentSyncJobs,
    failedEvents
  ] = await Promise.all([
    prisma.crmLead.count(),
    prisma.crmLead.count({ where: { lifecycleStatus: "active" } }),
    prisma.crmActivity.count({ where: { completed: false, deadline: { lt: new Date() } } }),
    prisma.crmLead.count({ where: { activities: { none: { completed: false } }, lifecycleStatus: "active" } }),
    prisma.workerDailyReport.count({
      where: {
        status: "submitted",
        submittedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.workerDailyReport.count({ where: { status: "missed" } }),
    prisma.client.count({ where: { crmLeadId: { not: null } } }),
    prisma.project.count({ where: { crmLeadId: { not: null } } }),
    prisma.task.count({ where: { crmLeadId: { not: null } } }),
    prisma.crmLead.aggregate({ _sum: { amount: true }, where: { lifecycleStatus: "active" } }),
    prisma.crmLead.groupBy({
      by: ["stageExternalId"],
      _count: { _all: true },
      orderBy: { _count: { stageExternalId: "desc" } }
    }),
    prisma.syncJob.findMany({
      where: { provider: "bitrix24" },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.integrationEvent.count({ where: { status: "failed" } })
  ]);

  const stageIds = byStage.map((item) => item.stageExternalId).filter(Boolean) as string[];
  const stages = await prisma.crmStage.findMany({ where: { externalId: { in: stageIds } } });
  const stageById = new Map(stages.map((stage) => [stage.externalId, stage]));

  response.json({
    totals: {
      totalLeads,
      activeLeads,
      overdueActivities,
      leadsWithoutActivities,
      reportsSubmittedToday,
      reportsMissed,
      failedEvents,
      linkedClients,
      linkedProjects,
      linkedTasks,
      pipelineAmount: pipelineAmount._sum.amount ?? 0
    },
    byStage: byStage.map((item) => ({
      stageExternalId: item.stageExternalId,
      stageName: item.stageExternalId ? stageById.get(item.stageExternalId)?.name ?? item.stageExternalId : "No stage",
      count: item._count._all
    })),
    recentSyncJobs
  });
});
