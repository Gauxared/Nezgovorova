import { Router } from "express";
import { ApiError } from "../../common/api-error.js";
import { writeAuditLog } from "../../common/audit.js";
import { optionalDate, optionalString, requiredDate, requiredString } from "../../common/validation.js";
import { prisma } from "../../prisma/client.js";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";

export const projectsRouter = Router();
const include = { client: true, crmLead: { select: { id: true, title: true, externalId: true } }, responsibleUser: { select: { id: true, fullName: true } }, direction: true, status: true };

projectsRouter.use(requireAuth);

projectsRouter.get("/", requireRoles(["admin", "project_manager", "finance", "director", "analyst"]), async (request, response, next) => {
  try {
    const search = typeof request.query.search === "string" ? request.query.search : undefined;
    const projects = await prisma.project.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
      include,
      orderBy: { createdAt: "desc" }
    });
    response.json({ data: projects });
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/:id", requireRoles(["admin", "project_manager", "finance", "director", "analyst"]), async (request, response, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: request.params.id }, include });
    if (!project) throw new ApiError(404, "NOT_FOUND", "Проект не найден");
    response.json({ data: project });
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/", requireRoles(["admin", "project_manager"]), async (request, response, next) => {
  try {
    const project = await prisma.project.create({
      data: {
        name: requiredString(request.body.name, "name"),
        clientId: requiredString(request.body.clientId, "clientId"),
        crmLeadId: optionalString(request.body.crmLeadId),
        responsibleUserId: requiredString(request.body.responsibleUserId, "responsibleUserId"),
        directionId: requiredString(request.body.directionId, "directionId"),
        statusId: requiredString(request.body.statusId, "statusId"),
        startDate: requiredDate(request.body.startDate, "startDate"),
        plannedEndDate: optionalDate(request.body.plannedEndDate),
        actualEndDate: optionalDate(request.body.actualEndDate),
        budget: requiredString(String(request.body.budget ?? ""), "budget"),
        description: optionalString(request.body.description)
      },
      include
    });
    await writeAuditLog({ user: request.user, action: "create", entityType: "Project", entityId: project.id, newValue: project });
    response.status(201).json({ data: project });
  } catch (error) {
    next(error);
  }
});

projectsRouter.patch("/:id", requireRoles(["admin", "project_manager"]), async (request, response, next) => {
  try {
    const oldValue = await prisma.project.findUnique({ where: { id: request.params.id }, include });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Проект не найден");
    const project = await prisma.project.update({
      where: { id: request.params.id },
      data: {
        name: request.body.name === undefined ? undefined : requiredString(request.body.name, "name"),
        clientId: request.body.clientId === undefined ? undefined : requiredString(request.body.clientId, "clientId"),
        crmLeadId: request.body.crmLeadId === undefined ? undefined : optionalString(request.body.crmLeadId),
        responsibleUserId: request.body.responsibleUserId === undefined ? undefined : requiredString(request.body.responsibleUserId, "responsibleUserId"),
        directionId: request.body.directionId === undefined ? undefined : requiredString(request.body.directionId, "directionId"),
        statusId: request.body.statusId === undefined ? undefined : requiredString(request.body.statusId, "statusId"),
        startDate: request.body.startDate === undefined ? undefined : requiredDate(request.body.startDate, "startDate"),
        plannedEndDate: request.body.plannedEndDate === undefined ? undefined : optionalDate(request.body.plannedEndDate),
        actualEndDate: request.body.actualEndDate === undefined ? undefined : optionalDate(request.body.actualEndDate),
        budget: request.body.budget === undefined ? undefined : requiredString(String(request.body.budget), "budget"),
        description: request.body.description === undefined ? undefined : optionalString(request.body.description)
      },
      include
    });
    await writeAuditLog({ user: request.user, action: "update", entityType: "Project", entityId: project.id, oldValue, newValue: project });
    response.json({ data: project });
  } catch (error) {
    next(error);
  }
});

projectsRouter.delete("/:id", requireRoles(["admin", "project_manager"]), async (request, response, next) => {
  try {
    const oldValue = await prisma.project.findUnique({ where: { id: request.params.id }, include });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Проект не найден");
    await prisma.project.delete({ where: { id: request.params.id } });
    await writeAuditLog({ user: request.user, action: "delete", entityType: "Project", entityId: request.params.id, oldValue });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
