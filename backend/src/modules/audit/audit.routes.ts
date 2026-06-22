import { AuditAction } from "@prisma/client";
import { Router } from "express";
import { optionalDate } from "../../common/validation.js";
import { prisma } from "../../prisma/client.js";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";

export const auditRouter = Router();

auditRouter.use(requireAuth, requireRoles(["admin", "analyst"]));

auditRouter.get("/", async (request, response, next) => {
  try {
    const dateFrom = optionalDate(request.query.dateFrom);
    const dateTo = optionalDate(request.query.dateTo);
    const logs = await prisma.auditLog.findMany({
      where: {
        userId: typeof request.query.userId === "string" && request.query.userId ? request.query.userId : undefined,
        action: typeof request.query.action === "string" && request.query.action ? (request.query.action as AuditAction) : undefined,
        entityType: typeof request.query.entityType === "string" && request.query.entityType ? request.query.entityType : undefined,
        createdAt: dateFrom || dateTo ? { gte: dateFrom ?? undefined, lte: dateTo ?? undefined } : undefined
      },
      include: { user: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 300
    });

    response.json({ data: logs });
  } catch (error) {
    next(error);
  }
});
