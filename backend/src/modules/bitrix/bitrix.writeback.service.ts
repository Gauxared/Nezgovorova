import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client.js";
import { bitrixClient } from "./bitrix.client.js";

function commandKey(type: string, targetId: string, payload: unknown) {
  return `bitrix:${type}:${targetId}:${Buffer.from(JSON.stringify(payload)).toString("base64url").slice(0, 64)}`;
}

export async function queueBitrixTimelineComment(params: { leadId: string; comment: string }) {
  const lead = await prisma.crmLead.findUniqueOrThrow({ where: { id: params.leadId } });
  const payload = {
    fields: {
      ENTITY_ID: lead.externalId,
      ENTITY_TYPE: "lead",
      COMMENT: params.comment
    }
  };

  return prisma.outboundCommand.upsert({
    where: { idempotencyKey: commandKey("comment", lead.externalId, payload) },
    create: {
      provider: "bitrix24",
      commandType: "bitrix_add_timeline_comment",
      leadId: lead.id,
      idempotencyKey: commandKey("comment", lead.externalId, payload),
      payload: payload as Prisma.InputJsonObject
    },
    update: {}
  });
}

export async function queueBitrixActivityCompletion(params: { activityId: string }) {
  const activity = await prisma.crmActivity.findUniqueOrThrow({ where: { id: params.activityId } });
  const payload = {
    id: activity.externalId,
    fields: {
      COMPLETED: "Y"
    }
  };

  return prisma.outboundCommand.upsert({
    where: { idempotencyKey: commandKey("complete_activity", activity.externalId, payload) },
    create: {
      provider: "bitrix24",
      commandType: "bitrix_complete_activity",
      activityId: activity.id,
      idempotencyKey: commandKey("complete_activity", activity.externalId, payload),
      payload: payload as Prisma.InputJsonObject
    },
    update: {}
  });
}

function methodForCommand(commandType: string) {
  if (commandType === "bitrix_add_timeline_comment") {
    return "crm.timeline.comment.add";
  }

  if (commandType === "bitrix_complete_activity") {
    return "crm.activity.update";
  }

  if (commandType === "bitrix_add_activity") {
    return "crm.activity.add";
  }

  if (commandType === "bitrix_update_lead_stage") {
    return "crm.lead.update";
  }

  throw new Error(`Unsupported Bitrix command type: ${commandType}`);
}

export async function processBitrixOutboundCommands(limit = 20) {
  const commands = await prisma.outboundCommand.findMany({
    where: {
      provider: "bitrix24",
      status: "queued",
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: new Date() } }]
    },
    orderBy: { createdAt: "asc" },
    take: limit
  });

  const results = [];
  for (const command of commands) {
    try {
      await prisma.outboundCommand.update({
        where: { id: command.id },
        data: { status: "sent", attempts: { increment: 1 } }
      });

      const response = await bitrixClient.call(methodForCommand(command.commandType), command.payload as Record<string, unknown>);
      const updated = await prisma.outboundCommand.update({
        where: { id: command.id },
        data: {
          status: "succeeded",
          response: response as Prisma.InputJsonObject,
          sentAt: new Date()
        }
      });
      results.push(updated);
    } catch (error) {
      const updated = await prisma.outboundCommand.update({
        where: { id: command.id },
        data: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown Bitrix write-back error"
        }
      });
      results.push(updated);
    }
  }

  return results;
}
