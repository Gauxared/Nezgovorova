import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client.js";
import { queueTelegramMessage } from "../telegram/telegram.service.js";

function startOfDay(date = new Date()) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function endOfDay(date = new Date()) {
  const value = startOfDay(date);
  value.setUTCDate(value.getUTCDate() + 1);
  value.setUTCMilliseconds(value.getUTCMilliseconds() - 1);
  return value;
}

function planMessage(workerName: string, items: Array<{ title: string; dueAt?: Date | null }>) {
  if (items.length === 0) {
    return `Daily plan for ${workerName}: no open CRM activities for today.`;
  }

  const lines = items.map((item, index) => {
    const due = item.dueAt ? `, due ${item.dueAt.toISOString().slice(0, 16).replace("T", " ")}` : "";
    return `${index + 1}. ${item.title}${due}`;
  });

  return [`Daily plan for ${workerName}`, ...lines, "", "Reply in the evening with progress for each item."].join("\n");
}

export async function generateDailyPlan(workerId: string, date = new Date()) {
  const worker = await prisma.externalWorker.findUnique({
    where: { id: workerId },
    include: { messengerAccounts: true }
  });

  if (!worker) {
    throw new Error("External worker not found");
  }

  const workDate = startOfDay(date);
  const dayEnd = endOfDay(date);
  const activities = await prisma.crmActivity.findMany({
    where: {
      completed: false,
      OR: [
        { responsibleExternalId: worker.bitrixUserExternalId ?? undefined },
        { deadline: { lte: dayEnd } },
        { deadline: null }
      ]
    },
    include: { lead: true },
    orderBy: [{ deadline: "asc" }, { createdAt: "asc" }],
    take: 30
  });

  const plan = await prisma.workerDailyPlan.upsert({
    where: { workerId_workDate: { workerId, workDate } },
    create: {
      workerId,
      workDate,
      summary: `Generated ${activities.length} activity items`,
      items: {
        create: activities.map((activity, index) => ({
          activityId: activity.id,
          leadId: activity.lead?.id,
          title: activity.lead ? `${activity.lead.title}: ${activity.subject}` : activity.subject,
          dueAt: activity.deadline,
          sortOrder: index
        }))
      }
    },
    update: {
      summary: `Regenerated ${activities.length} activity items`
    },
    include: { items: true }
  });

  return { plan, worker };
}

export async function sendDailyPlan(workerId: string, date = new Date()) {
  const { plan, worker } = await generateDailyPlan(workerId, date);
  const account = worker.messengerAccounts.find((item) => item.provider === "telegram" && item.isVerified && item.externalChatId);

  if (!account?.externalChatId) {
    return { plan, queued: false, reason: "No verified Telegram account" };
  }

  const delivery = await queueTelegramMessage({
    chatId: account.externalChatId,
    messengerAccountId: account.id,
    text: planMessage(worker.fullName, plan.items)
  });

  await prisma.workerDailyPlan.update({
    where: { id: plan.id },
    data: { status: "sent", sentAt: new Date() }
  });

  return { plan, queued: true, deliveryId: delivery.id };
}

export async function submitDailyReport(params: {
  workerId: string;
  workDate?: Date;
  summary?: string;
  items: Array<{
    planItemId?: string;
    leadId?: string;
    activityId?: string;
    status: "planned" | "in_progress" | "done" | "blocked" | "postponed";
    comment?: string;
    needsManager?: boolean;
    nextActionAt?: Date;
  }>;
  rawPayload?: Prisma.InputJsonValue;
}) {
  const workDate = startOfDay(params.workDate ?? new Date());
  const plan = await prisma.workerDailyPlan.findUnique({
    where: { workerId_workDate: { workerId: params.workerId, workDate } }
  });

  return prisma.workerDailyReport.upsert({
    where: { workerId_workDate: { workerId: params.workerId, workDate } },
    create: {
      workerId: params.workerId,
      planId: plan?.id,
      workDate,
      status: "submitted",
      submittedAt: new Date(),
      summary: params.summary,
      rawPayload: params.rawPayload ?? Prisma.JsonNull,
      items: {
        create: params.items.map((item) => ({
          planItemId: item.planItemId,
          leadId: item.leadId,
          activityId: item.activityId,
          status: item.status,
          comment: item.comment,
          needsManager: item.needsManager ?? false,
          nextActionAt: item.nextActionAt
        }))
      }
    },
    update: {
      status: "submitted",
      submittedAt: new Date(),
      summary: params.summary,
      rawPayload: params.rawPayload ?? Prisma.JsonNull
    },
    include: { items: true }
  });
}

export async function sendDailyPlansForActiveWorkers(date = new Date()) {
  const workers = await prisma.externalWorker.findMany({
    where: { status: "active" },
    select: { id: true }
  });

  const results = [];
  for (const worker of workers) {
    results.push(await sendDailyPlan(worker.id, date));
  }

  return results;
}
