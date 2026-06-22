import { ReportType } from "@prisma/client";
import { Router } from "express";
import { ApiError } from "../../common/api-error.js";
import { writeAuditLog } from "../../common/audit.js";
import { optionalString, requiredString } from "../../common/validation.js";
import { prisma } from "../../prisma/client.js";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";
import { buildReportData, toCsv } from "./report-data.js";

export const reportsRouter = Router();

const include = {
  createdBy: { select: { id: true, fullName: true, email: true } }
};

function parseFilters(value: unknown) {
  if (!value || typeof value !== "object") return {};
  return value;
}

reportsRouter.use(requireAuth, requireRoles(["admin", "director", "analyst"]));

reportsRouter.get("/", async (_request, response, next) => {
  try {
    const reports = await prisma.report.findMany({ include, orderBy: { createdAt: "desc" } });
    response.json({ data: reports });
  } catch (error) {
    next(error);
  }
});

reportsRouter.post("/", async (request, response, next) => {
  try {
    const report = await prisma.report.create({
      data: {
        title: requiredString(request.body.title, "title"),
        description: optionalString(request.body.description),
        type: requiredString(request.body.type, "type") as ReportType,
        filters: parseFilters(request.body.filters),
        createdById: request.user!.id
      },
      include
    });
    await writeAuditLog({ user: request.user, action: "create", entityType: "Report", entityId: report.id, newValue: report });
    response.status(201).json({ data: report });
  } catch (error) {
    next(error);
  }
});

reportsRouter.get("/:id", async (request, response, next) => {
  try {
    const report = await prisma.report.findUnique({ where: { id: request.params.id }, include });
    if (!report) throw new ApiError(404, "NOT_FOUND", "Отчет не найден");
    const result = await buildReportData(report.type, report.filters);
    response.json({ data: { ...report, result } });
  } catch (error) {
    next(error);
  }
});

reportsRouter.patch("/:id", async (request, response, next) => {
  try {
    const oldValue = await prisma.report.findUnique({ where: { id: request.params.id } });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Отчет не найден");
    const report = await prisma.report.update({
      where: { id: request.params.id },
      data: {
        title: request.body.title === undefined ? undefined : requiredString(request.body.title, "title"),
        description: request.body.description === undefined ? undefined : optionalString(request.body.description),
        type: request.body.type === undefined ? undefined : (requiredString(request.body.type, "type") as ReportType),
        filters: request.body.filters === undefined ? undefined : parseFilters(request.body.filters)
      },
      include
    });
    await writeAuditLog({ user: request.user, action: "update", entityType: "Report", entityId: report.id, oldValue, newValue: report });
    response.json({ data: report });
  } catch (error) {
    next(error);
  }
});

reportsRouter.delete("/:id", async (request, response, next) => {
  try {
    const oldValue = await prisma.report.findUnique({ where: { id: request.params.id } });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Отчет не найден");
    await prisma.report.delete({ where: { id: request.params.id } });
    await writeAuditLog({ user: request.user, action: "delete", entityType: "Report", entityId: request.params.id, oldValue });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

reportsRouter.get("/:id/export", async (request, response, next) => {
  try {
    const format = typeof request.query.format === "string" ? request.query.format : "csv";
    if (format !== "csv") {
      throw new ApiError(400, "UNSUPPORTED_FORMAT", "Поддерживается только CSV-экспорт");
    }

    const report = await prisma.report.findUnique({ where: { id: request.params.id } });
    if (!report) throw new ApiError(404, "NOT_FOUND", "Отчет не найден");

    const result = await buildReportData(report.type, report.filters);
    await writeAuditLog({ user: request.user, action: "export", entityType: "Report", entityId: report.id, newValue: { format } });

    const safeName = report.title.replace(/[^\p{L}\p{N}_-]+/gu, "_");
    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="${safeName || "report"}.csv"`);
    response.send(toCsv(result));
  } catch (error) {
    next(error);
  }
});
