import { prisma } from "../prisma/client.js";
import type { AuditAction } from "@prisma/client";
export async function writeAuditLog(params: {
  user?: { id: string };
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.user?.id,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue === undefined ? undefined : JSON.parse(JSON.stringify(params.oldValue)),
      newValue: params.newValue === undefined ? undefined : JSON.parse(JSON.stringify(params.newValue))
    }
  });
}
