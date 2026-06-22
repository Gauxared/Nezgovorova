import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client.js";
import { bitrixClient } from "./bitrix.client.js";
import { mapBitrixActivity, mapBitrixLead, mapBitrixStage } from "./bitrix.mapper.js";

type BitrixListResult = Array<Record<string, unknown>>;

async function createSyncJob(jobType: string, requestedById?: string) {
  return prisma.syncJob.create({
    data: {
      provider: "bitrix24",
      jobType,
      status: "running",
      startedAt: new Date(),
      requestedById
    }
  });
}

async function finishSyncJob(id: string, stats: Prisma.InputJsonValue) {
  return prisma.syncJob.update({
    where: { id },
    data: {
      status: "succeeded",
      finishedAt: new Date(),
      stats
    }
  });
}

async function failSyncJob(id: string, error: unknown) {
  return prisma.syncJob.update({
    where: { id },
    data: {
      status: "failed",
      finishedAt: new Date(),
      errorMessage: error instanceof Error ? error.message : "Unknown sync error"
    }
  });
}

export async function syncBitrixStages(requestedById?: string) {
  const job = await createSyncJob("stages", requestedById);

  try {
    const response = await bitrixClient.call<BitrixListResult>("crm.status.list", {
      filter: { ENTITY_ID: "STATUS" },
      order: { SORT: "ASC" }
    });

    const stages = response.result ?? [];
    for (const raw of stages) {
      const data = mapBitrixStage(raw);
      await prisma.crmStage.upsert({
        where: { externalId: data.externalId },
        create: data,
        update: data
      });
    }

    await finishSyncJob(job.id, { stages: stages.length });
    return { jobId: job.id, stages: stages.length };
  } catch (error) {
    await failSyncJob(job.id, error);
    throw error;
  }
}

export async function syncBitrixLeads(requestedById?: string) {
  const job = await createSyncJob("leads", requestedById);

  try {
    const response = await bitrixClient.call<BitrixListResult>("crm.lead.list", {
      order: { DATE_MODIFY: "ASC" },
      select: ["*", "PHONE", "EMAIL", "UTM_*"]
    });

    const leads = response.result ?? [];
    for (const raw of leads) {
      const data = mapBitrixLead(raw);
      await prisma.crmLead.upsert({
        where: { externalId: data.externalId },
        create: data,
        update: data
      });
    }

    await finishSyncJob(job.id, { leads: leads.length });
    return { jobId: job.id, leads: leads.length };
  } catch (error) {
    await failSyncJob(job.id, error);
    throw error;
  }
}

export async function syncBitrixActivities(requestedById?: string) {
  const job = await createSyncJob("activities", requestedById);

  try {
    const response = await bitrixClient.call<BitrixListResult>("crm.activity.list", {
      order: { LAST_UPDATED: "ASC" },
      select: ["*"]
    });

    const activities = response.result ?? [];
    for (const raw of activities) {
      const data = mapBitrixActivity(raw);
      await prisma.crmActivity.upsert({
        where: { externalId: data.externalId },
        create: data,
        update: data
      });
    }

    await finishSyncJob(job.id, { activities: activities.length });
    return { jobId: job.id, activities: activities.length };
  } catch (error) {
    await failSyncJob(job.id, error);
    throw error;
  }
}

export async function syncBitrixLeadById(externalId: string) {
  const response = await bitrixClient.call<Record<string, unknown>>("crm.lead.get", { id: externalId });
  const raw = response.result;
  if (!raw) {
    return null;
  }

  const data = mapBitrixLead(raw);
  return prisma.crmLead.upsert({
    where: { externalId: data.externalId },
    create: data,
    update: data
  });
}

export async function syncBitrixActivityById(externalId: string) {
  const response = await bitrixClient.call<Record<string, unknown>>("crm.activity.get", { id: externalId });
  const raw = response.result;
  if (!raw) {
    return null;
  }

  const data = mapBitrixActivity(raw);
  return prisma.crmActivity.upsert({
    where: { externalId: data.externalId },
    create: data,
    update: data
  });
}

export async function runFullBitrixSync(requestedById?: string) {
  const stages = await syncBitrixStages(requestedById);
  const leads = await syncBitrixLeads(requestedById);
  const activities = await syncBitrixActivities(requestedById);

  return { stages, leads, activities };
}
