import { Router } from "express";
import { StatusEntityType } from "@prisma/client";
import { ApiError } from "../../common/api-error.js";
import { writeAuditLog } from "../../common/audit.js";
import { optionalBoolean, optionalDate, optionalNumber, optionalString, requiredDate, requiredString } from "../../common/validation.js";
import { prisma } from "../../prisma/client.js";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";

export const referencesRouter = Router();

referencesRouter.use(requireAuth);

referencesRouter.get("/statuses", async (request, response, next) => {
  try {
    const entityType = typeof request.query.entityType === "string" ? (request.query.entityType as StatusEntityType) : undefined;
    const statuses = await prisma.status.findMany({ where: { entityType }, orderBy: [{ entityType: "asc" }, { sortOrder: "asc" }] });
    response.json({ data: statuses });
  } catch (error) {
    next(error);
  }
});

referencesRouter.get("/directions", async (_request, response, next) => {
  try {
    response.json({ data: await prisma.direction.findMany({ orderBy: { name: "asc" } }) });
  } catch (error) {
    next(error);
  }
});

referencesRouter.get("/periods", async (_request, response, next) => {
  try {
    response.json({ data: await prisma.reportPeriod.findMany({ orderBy: { dateFrom: "desc" } }) });
  } catch (error) {
    next(error);
  }
});

referencesRouter.use(requireRoles(["admin"]));

referencesRouter.post("/statuses", async (request, response, next) => {
  try {
    const status = await prisma.status.create({
      data: {
        entityType: requiredString(request.body.entityType, "entityType") as StatusEntityType,
        code: requiredString(request.body.code, "code"),
        name: requiredString(request.body.name, "name"),
        color: optionalString(request.body.color),
        isFinal: Boolean(request.body.isFinal),
        sortOrder: optionalNumber(request.body.sortOrder) ?? 0
      }
    });
    await writeAuditLog({ user: request.user, action: "create", entityType: "Status", entityId: status.id, newValue: status });
    response.status(201).json({ data: status });
  } catch (error) {
    next(error);
  }
});

referencesRouter.patch("/statuses/:id", async (request, response, next) => {
  try {
    const oldValue = await prisma.status.findUnique({ where: { id: request.params.id } });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Статус не найден");
    const status = await prisma.status.update({
      where: { id: request.params.id },
      data: {
        entityType: request.body.entityType === undefined ? undefined : (requiredString(request.body.entityType, "entityType") as StatusEntityType),
        code: request.body.code === undefined ? undefined : requiredString(request.body.code, "code"),
        name: request.body.name === undefined ? undefined : requiredString(request.body.name, "name"),
        color: request.body.color === undefined ? undefined : optionalString(request.body.color),
        isFinal: optionalBoolean(request.body.isFinal),
        sortOrder: optionalNumber(request.body.sortOrder)
      }
    });
    await writeAuditLog({ user: request.user, action: "update", entityType: "Status", entityId: status.id, oldValue, newValue: status });
    response.json({ data: status });
  } catch (error) {
    next(error);
  }
});

referencesRouter.delete("/statuses/:id", async (request, response, next) => {
  try {
    const oldValue = await prisma.status.findUnique({ where: { id: request.params.id } });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Статус не найден");
    await prisma.status.delete({ where: { id: request.params.id } });
    await writeAuditLog({ user: request.user, action: "delete", entityType: "Status", entityId: request.params.id, oldValue });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

referencesRouter.post("/directions", async (request, response, next) => {
  try {
    const direction = await prisma.direction.create({
      data: {
        name: requiredString(request.body.name, "name"),
        description: optionalString(request.body.description),
        isActive: request.body.isActive ?? true
      }
    });
    await writeAuditLog({ user: request.user, action: "create", entityType: "Direction", entityId: direction.id, newValue: direction });
    response.status(201).json({ data: direction });
  } catch (error) {
    next(error);
  }
});

referencesRouter.patch("/directions/:id", async (request, response, next) => {
  try {
    const oldValue = await prisma.direction.findUnique({ where: { id: request.params.id } });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Направление не найдено");
    const direction = await prisma.direction.update({
      where: { id: request.params.id },
      data: {
        name: request.body.name === undefined ? undefined : requiredString(request.body.name, "name"),
        description: request.body.description === undefined ? undefined : optionalString(request.body.description),
        isActive: optionalBoolean(request.body.isActive)
      }
    });
    await writeAuditLog({ user: request.user, action: "update", entityType: "Direction", entityId: direction.id, oldValue, newValue: direction });
    response.json({ data: direction });
  } catch (error) {
    next(error);
  }
});

referencesRouter.delete("/directions/:id", async (request, response, next) => {
  try {
    const oldValue = await prisma.direction.findUnique({ where: { id: request.params.id } });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Направление не найдено");
    const direction = await prisma.direction.update({ where: { id: request.params.id }, data: { isActive: false } });
    await writeAuditLog({ user: request.user, action: "delete", entityType: "Direction", entityId: direction.id, oldValue, newValue: direction });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

referencesRouter.post("/periods", async (request, response, next) => {
  try {
    const period = await prisma.reportPeriod.create({
      data: {
        name: requiredString(request.body.name, "name"),
        dateFrom: requiredDate(request.body.dateFrom, "dateFrom"),
        dateTo: requiredDate(request.body.dateTo, "dateTo"),
        isClosed: Boolean(request.body.isClosed)
      }
    });
    await writeAuditLog({ user: request.user, action: "create", entityType: "ReportPeriod", entityId: period.id, newValue: period });
    response.status(201).json({ data: period });
  } catch (error) {
    next(error);
  }
});

referencesRouter.patch("/periods/:id", async (request, response, next) => {
  try {
    const oldValue = await prisma.reportPeriod.findUnique({ where: { id: request.params.id } });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Период не найден");
    const period = await prisma.reportPeriod.update({
      where: { id: request.params.id },
      data: {
        name: request.body.name === undefined ? undefined : requiredString(request.body.name, "name"),
        dateFrom: request.body.dateFrom === undefined ? undefined : requiredDate(request.body.dateFrom, "dateFrom"),
        dateTo: request.body.dateTo === undefined ? undefined : requiredDate(request.body.dateTo, "dateTo"),
        isClosed: optionalBoolean(request.body.isClosed)
      }
    });
    await writeAuditLog({ user: request.user, action: "update", entityType: "ReportPeriod", entityId: period.id, oldValue, newValue: period });
    response.json({ data: period });
  } catch (error) {
    next(error);
  }
});

referencesRouter.delete("/periods/:id", async (request, response, next) => {
  try {
    const oldValue = await prisma.reportPeriod.findUnique({ where: { id: request.params.id } });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Период не найден");
    await prisma.reportPeriod.delete({ where: { id: request.params.id } });
    await writeAuditLog({ user: request.user, action: "delete", entityType: "ReportPeriod", entityId: request.params.id, oldValue });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
