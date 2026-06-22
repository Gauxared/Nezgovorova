import { Router } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../../common/api-error.js";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";
import { bitrixClient } from "./bitrix.client.js";
import { runFullBitrixSync, syncBitrixActivityById, syncBitrixLeadById, syncBitrixStages } from "./bitrix.sync.service.js";
import { processBitrixOutboundCommands, queueBitrixActivityCompletion, queueBitrixTimelineComment } from "./bitrix.writeback.service.js";
import { prisma } from "../../prisma/client.js";

export const bitrixRouter = Router();

bitrixRouter.get("/status", requireAuth, async (_request, response) => {
  const lastJobs = await prisma.syncJob.findMany({
    where: { provider: "bitrix24" },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  response.json({
    configured: bitrixClient.isConfigured(),
    lastJobs
  });
});

bitrixRouter.post("/sync", requireAuth, requireRoles(["admin", "analyst"]), async (request, response, next) => {
  try {
    const result = await runFullBitrixSync(request.user?.id);
    response.status(202).json(result);
  } catch (error) {
    next(error);
  }
});

bitrixRouter.post("/sync/stages", requireAuth, requireRoles(["admin", "analyst"]), async (request, response, next) => {
  try {
    const result = await syncBitrixStages(request.user?.id);
    response.status(202).json(result);
  } catch (error) {
    next(error);
  }
});

bitrixRouter.post("/commands/timeline-comment", requireAuth, requireRoles(["admin", "analyst"]), async (request, response, next) => {
  try {
    const leadId = String(request.body?.leadId ?? "");
    const comment = String(request.body?.comment ?? "");
    if (!leadId || !comment) {
      throw new ApiError(400, "VALIDATION_ERROR", "leadId and comment are required");
    }

    const command = await queueBitrixTimelineComment({ leadId, comment });
    response.status(201).json(command);
  } catch (error) {
    next(error);
  }
});

bitrixRouter.post("/commands/complete-activity", requireAuth, requireRoles(["admin", "analyst"]), async (request, response, next) => {
  try {
    const activityId = String(request.body?.activityId ?? "");
    if (!activityId) {
      throw new ApiError(400, "VALIDATION_ERROR", "activityId is required");
    }

    const command = await queueBitrixActivityCompletion({ activityId });
    response.status(201).json(command);
  } catch (error) {
    next(error);
  }
});

bitrixRouter.post("/commands/process", requireAuth, requireRoles(["admin", "analyst"]), async (_request, response, next) => {
  try {
    const result = await processBitrixOutboundCommands();
    response.json({ processed: result.length, result });
  } catch (error) {
    next(error);
  }
});

bitrixRouter.post("/webhook", async (request, response, next) => {
  const event = String(request.body?.event ?? request.body?.EVENT ?? "unknown");
  const externalId = request.body?.data?.FIELDS?.ID ? String(request.body.data.FIELDS.ID) : undefined;
  const idempotencyKey = `bitrix:${event}:${externalId ?? "unknown"}:${request.body?.ts ?? Date.now()}`;

  try {
    await prisma.integrationEvent.create({
      data: {
        provider: "bitrix24",
        direction: "inbound",
        eventType: event,
        externalId,
        idempotencyKey,
        status: "received",
        payload: request.body as Prisma.InputJsonObject
      }
    });

    if (!externalId) {
      throw new ApiError(400, "BITRIX_EVENT_WITHOUT_ID", "Bitrix event payload does not contain data.FIELDS.ID");
    }

    if (event.toUpperCase().includes("LEAD")) {
      await syncBitrixLeadById(externalId);
    } else if (event.toLowerCase().includes("activity")) {
      await syncBitrixActivityById(externalId);
    }

    await prisma.integrationEvent.update({
      where: { idempotencyKey },
      data: { status: "processed", processedAt: new Date() }
    });

    response.json({ ok: true });
  } catch (error) {
    await prisma.integrationEvent
      .update({
        where: { idempotencyKey },
        data: {
          status: error instanceof ApiError && error.statusCode === 400 ? "ignored" : "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown webhook error",
          processedAt: new Date()
        }
      })
      .catch(() => undefined);

    next(error);
  }
});
