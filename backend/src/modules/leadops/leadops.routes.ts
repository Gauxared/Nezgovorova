import { Router } from "express";
import { ApiError } from "../../common/api-error.js";
import { prisma } from "../../prisma/client.js";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";
import { generateDailyPlan, sendDailyPlan, sendDailyPlansForActiveWorkers, submitDailyReport } from "./daily-workflow.service.js";

export const leadopsRouter = Router();

leadopsRouter.get("/leads", requireAuth, async (request, response) => {
  const take = Math.min(Number(request.query.take ?? 50), 200);
  const leads = await prisma.crmLead.findMany({
    where: {
      lifecycleStatus: request.query.status ? String(request.query.status) as "active" : undefined
    },
    include: {
      stage: true,
      activities: {
        where: { completed: false },
        orderBy: { deadline: "asc" },
        take: 3
      }
    },
    orderBy: { updatedAt: "desc" },
    take
  });

  response.json({ items: leads });
});

leadopsRouter.get("/lead-options", requireAuth, async (_request, response) => {
  const leads = await prisma.crmLead.findMany({
    where: { lifecycleStatus: "active" },
    select: { id: true, title: true, externalId: true },
    orderBy: { updatedAt: "desc" },
    take: 200
  });

  response.json({
    data: leads.map((lead) => ({
      id: lead.id,
      name: `${lead.title} (${lead.externalId})`
    }))
  });
});

leadopsRouter.get("/leads/:id", requireAuth, async (request, response, next) => {
  try {
    const lead = await prisma.crmLead.findUnique({
      where: { id: request.params.id },
      include: {
        stage: true,
        activities: { orderBy: [{ completed: "asc" }, { deadline: "asc" }] },
        clients: { orderBy: { createdAt: "desc" } },
        projects: {
          include: { status: true, responsibleUser: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: "desc" }
        },
        tasks: {
          include: { status: true, project: true, responsibleUser: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: "desc" }
        },
        reportItems: {
          include: {
            report: {
              include: { worker: true }
            },
            activity: true
          },
          orderBy: { createdAt: "desc" },
          take: 50
        },
        outboundCommands: { orderBy: { createdAt: "desc" }, take: 50 }
      }
    });

    if (!lead) {
      throw new ApiError(404, "NOT_FOUND", "Lead not found");
    }

    const integrationEvents = await prisma.integrationEvent.findMany({
      where: {
        provider: "bitrix24",
        externalId: lead.externalId
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    response.json({ data: { ...lead, integrationEvents } });
  } catch (error) {
    next(error);
  }
});

leadopsRouter.get("/workers", requireAuth, async (_request, response) => {
  const workers = await prisma.externalWorker.findMany({
    include: {
      messengerAccounts: true,
      dailyPlans: { orderBy: { workDate: "desc" }, take: 3 },
      dailyReports: { orderBy: { workDate: "desc" }, take: 3 }
    },
    orderBy: { createdAt: "desc" }
  });
  response.json({ items: workers });
});

leadopsRouter.get("/workers/:id", requireAuth, async (request, response, next) => {
  try {
    const worker = await prisma.externalWorker.findUnique({
      where: { id: request.params.id },
      include: {
        messengerAccounts: true,
        dailyPlans: {
          include: { items: { include: { lead: true, activity: true } } },
          orderBy: { workDate: "desc" },
          take: 20
        },
        dailyReports: {
          include: { items: { include: { lead: true, activity: true } } },
          orderBy: { workDate: "desc" },
          take: 20
        }
      }
    });

    if (!worker) {
      throw new ApiError(404, "NOT_FOUND", "Worker not found");
    }

    response.json({ data: worker });
  } catch (error) {
    next(error);
  }
});

leadopsRouter.get("/tasks/unified", requireAuth, async (_request, response) => {
  const [internalTasks, crmActivities] = await Promise.all([
    prisma.task.findMany({
      include: {
        crmLead: { select: { id: true, title: true, externalId: true } },
        project: true,
        status: true,
        responsibleUser: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    }),
    prisma.crmActivity.findMany({
      include: { lead: { select: { id: true, title: true, externalId: true } } },
      orderBy: [{ completed: "asc" }, { deadline: "asc" }],
      take: 100
    })
  ]);

  response.json({
    items: [
      ...internalTasks.map((task) => ({
        id: task.id,
        source: "internal",
        title: task.title,
        status: task.status.name,
        dueAt: task.plannedEndDate,
        responsible: task.responsibleUser.fullName,
        lead: task.crmLead,
        project: task.project.name
      })),
      ...crmActivities.map((activity) => ({
        id: activity.id,
        source: "bitrix",
        title: activity.subject,
        status: activity.completed ? "completed" : activity.status,
        dueAt: activity.deadline,
        responsible: activity.responsibleName ?? activity.responsibleExternalId,
        lead: activity.lead,
        project: null
      }))
    ].sort((a, b) => String(a.dueAt ?? "").localeCompare(String(b.dueAt ?? "")))
  });
});

leadopsRouter.get("/integrations/status", requireAuth, async (_request, response) => {
  const [
    syncJobs,
    failedEvents,
    queuedTelegram,
    failedTelegram,
    queuedBitrix,
    failedBitrix,
    recentEvents,
    telegramQueue,
    bitrixQueue,
    recentErrors
  ] = await Promise.all([
    prisma.syncJob.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.integrationEvent.count({ where: { status: "failed" } }),
    prisma.messageDelivery.count({ where: { provider: "telegram", status: "queued" } }),
    prisma.messageDelivery.count({ where: { provider: "telegram", status: "failed" } }),
    prisma.outboundCommand.count({ where: { provider: "bitrix24", status: "queued" } }),
    prisma.outboundCommand.count({ where: { provider: "bitrix24", status: "failed" } }),
    prisma.integrationEvent.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.messageDelivery.findMany({
      where: { provider: "telegram", status: { in: ["queued", "failed"] } },
      include: {
        messengerAccount: {
          include: {
            worker: { select: { id: true, fullName: true, bitrixUserExternalId: true } }
          }
        }
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 12
    }),
    prisma.outboundCommand.findMany({
      where: { provider: "bitrix24", status: { in: ["queued", "failed"] } },
      include: {
        lead: { select: { id: true, title: true, externalId: true } },
        activity: { select: { id: true, subject: true, deadline: true } }
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 12
    }),
    prisma.integrationEvent.findMany({
      where: { status: "failed" },
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  response.json({
    counters: {
      failedEvents,
      queuedTelegram,
      failedTelegram,
      queuedBitrix,
      failedBitrix
    },
    syncJobs,
    recentEvents,
    telegramQueue,
    bitrixQueue,
    recentErrors
  });
});

leadopsRouter.post("/workers", requireAuth, requireRoles(["admin", "analyst"]), async (request, response, next) => {
  try {
    const fullName = String(request.body?.fullName ?? "");
    if (!fullName) {
      throw new ApiError(400, "VALIDATION_ERROR", "fullName is required");
    }

    const worker = await prisma.externalWorker.create({
      data: {
        fullName,
        bitrixUserExternalId: request.body?.bitrixUserExternalId ? String(request.body.bitrixUserExternalId) : undefined,
        timezone: request.body?.timezone ? String(request.body.timezone) : undefined,
        notes: request.body?.notes ? String(request.body.notes) : undefined
      }
    });

    response.status(201).json(worker);
  } catch (error) {
    next(error);
  }
});

leadopsRouter.post("/daily-plans/generate", requireAuth, requireRoles(["admin", "analyst"]), async (request, response, next) => {
  try {
    const workerId = String(request.body?.workerId ?? "");
    if (!workerId) {
      throw new ApiError(400, "VALIDATION_ERROR", "workerId is required");
    }

    const result = await generateDailyPlan(workerId, request.body?.date ? new Date(String(request.body.date)) : new Date());
    response.status(201).json(result.plan);
  } catch (error) {
    next(error);
  }
});

leadopsRouter.post("/daily-plans/send", requireAuth, requireRoles(["admin", "analyst"]), async (request, response, next) => {
  try {
    const workerId = request.body?.workerId ? String(request.body.workerId) : undefined;
    const date = request.body?.date ? new Date(String(request.body.date)) : new Date();
    const result = workerId ? await sendDailyPlan(workerId, date) : await sendDailyPlansForActiveWorkers(date);
    response.status(202).json(result);
  } catch (error) {
    next(error);
  }
});

leadopsRouter.post("/daily-reports", requireAuth, requireRoles(["admin", "analyst"]), async (request, response, next) => {
  try {
    const workerId = String(request.body?.workerId ?? "");
    if (!workerId) {
      throw new ApiError(400, "VALIDATION_ERROR", "workerId is required");
    }

    const report = await submitDailyReport({
      workerId,
      workDate: request.body?.workDate ? new Date(String(request.body.workDate)) : undefined,
      summary: request.body?.summary ? String(request.body.summary) : undefined,
      items: Array.isArray(request.body?.items) ? request.body.items : [],
      rawPayload: request.body
    });

    response.status(201).json(report);
  } catch (error) {
    next(error);
  }
});
