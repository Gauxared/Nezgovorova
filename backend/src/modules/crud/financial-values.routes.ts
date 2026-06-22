import { Router } from "express";
import { FinancialValueType } from "@prisma/client";
import { ApiError } from "../../common/api-error.js";
import { writeAuditLog } from "../../common/audit.js";
import { optionalString, requiredDate, requiredString } from "../../common/validation.js";
import { prisma } from "../../prisma/client.js";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";

export const financialValuesRouter = Router();
const include = { project: true, period: true, createdBy: { select: { id: true, fullName: true } } };

financialValuesRouter.use(requireAuth);

financialValuesRouter.get("/", requireRoles(["admin", "finance", "director", "analyst"]), async (_request, response, next) => {
  try {
    const values = await prisma.financialValue.findMany({ include, orderBy: { createdAt: "desc" } });
    response.json({ data: values });
  } catch (error) {
    next(error);
  }
});

financialValuesRouter.get("/:id", requireRoles(["admin", "finance", "director", "analyst"]), async (request, response, next) => {
  try {
    const value = await prisma.financialValue.findUnique({ where: { id: request.params.id }, include });
    if (!value) throw new ApiError(404, "NOT_FOUND", "Финансовая запись не найдена");
    response.json({ data: value });
  } catch (error) {
    next(error);
  }
});

financialValuesRouter.post("/", requireRoles(["admin", "finance"]), async (request, response, next) => {
  try {
    const value = await prisma.financialValue.create({
      data: {
        projectId: requiredString(request.body.projectId, "projectId"),
        periodId: requiredString(request.body.periodId, "periodId"),
        type: requiredString(request.body.type, "type") as FinancialValueType,
        amount: requiredString(String(request.body.amount ?? ""), "amount"),
        comment: optionalString(request.body.comment),
        date: requiredDate(request.body.date, "date"),
        createdById: request.user!.id
      },
      include
    });
    await writeAuditLog({ user: request.user, action: "create", entityType: "FinancialValue", entityId: value.id, newValue: value });
    response.status(201).json({ data: value });
  } catch (error) {
    next(error);
  }
});

financialValuesRouter.patch("/:id", requireRoles(["admin", "finance"]), async (request, response, next) => {
  try {
    const oldValue = await prisma.financialValue.findUnique({ where: { id: request.params.id }, include });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Финансовая запись не найдена");
    const value = await prisma.financialValue.update({
      where: { id: request.params.id },
      data: {
        projectId: request.body.projectId === undefined ? undefined : requiredString(request.body.projectId, "projectId"),
        periodId: request.body.periodId === undefined ? undefined : requiredString(request.body.periodId, "periodId"),
        type: request.body.type === undefined ? undefined : (requiredString(request.body.type, "type") as FinancialValueType),
        amount: request.body.amount === undefined ? undefined : requiredString(String(request.body.amount), "amount"),
        comment: request.body.comment === undefined ? undefined : optionalString(request.body.comment),
        date: request.body.date === undefined ? undefined : requiredDate(request.body.date, "date")
      },
      include
    });
    await writeAuditLog({ user: request.user, action: "update", entityType: "FinancialValue", entityId: value.id, oldValue, newValue: value });
    response.json({ data: value });
  } catch (error) {
    next(error);
  }
});

financialValuesRouter.delete("/:id", requireRoles(["admin", "finance"]), async (request, response, next) => {
  try {
    const oldValue = await prisma.financialValue.findUnique({ where: { id: request.params.id }, include });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Финансовая запись не найдена");
    await prisma.financialValue.delete({ where: { id: request.params.id } });
    await writeAuditLog({ user: request.user, action: "delete", entityType: "FinancialValue", entityId: request.params.id, oldValue });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
