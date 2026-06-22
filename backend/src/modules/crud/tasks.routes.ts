import { Router } from "express";
import { ApiError } from "../../common/api-error.js";
import { writeAuditLog } from "../../common/audit.js";
import { optionalDate, optionalNumber, optionalString, requiredString } from "../../common/validation.js";
import { prisma } from "../../prisma/client.js";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";

export const tasksRouter = Router();
const include = { project: true, crmLead: { select: { id: true, title: true, externalId: true } }, responsibleUser: { select: { id: true, fullName: true } }, status: true };

tasksRouter.use(requireAuth);

tasksRouter.get("/", requireRoles(["admin", "project_manager", "director", "analyst"]), async (request, response, next) => {
  try {
    const search = typeof request.query.search === "string" ? request.query.search : undefined;
    const tasks = await prisma.task.findMany({
      where: search ? { title: { contains: search, mode: "insensitive" } } : undefined,
      include,
      orderBy: { createdAt: "desc" }
    });
    response.json({ data: tasks });
  } catch (error) {
    next(error);
  }
});

tasksRouter.get("/:id", requireRoles(["admin", "project_manager", "director", "analyst"]), async (request, response, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: request.params.id }, include });
    if (!task) throw new ApiError(404, "NOT_FOUND", "Задача не найдена");
    response.json({ data: task });
  } catch (error) {
    next(error);
  }
});

tasksRouter.post("/", requireRoles(["admin", "project_manager"]), async (request, response, next) => {
  try {
    const task = await prisma.task.create({
      data: {
        projectId: requiredString(request.body.projectId, "projectId"),
        crmLeadId: optionalString(request.body.crmLeadId),
        title: requiredString(request.body.title, "title"),
        description: optionalString(request.body.description),
        responsibleUserId: requiredString(request.body.responsibleUserId, "responsibleUserId"),
        statusId: requiredString(request.body.statusId, "statusId"),
        priority: requiredString(request.body.priority, "priority"),
        plannedEndDate: optionalDate(request.body.plannedEndDate),
        actualEndDate: optionalDate(request.body.actualEndDate),
        laborHours: optionalNumber(request.body.laborHours)
      },
      include
    });
    await writeAuditLog({ user: request.user, action: "create", entityType: "Task", entityId: task.id, newValue: task });
    response.status(201).json({ data: task });
  } catch (error) {
    next(error);
  }
});

tasksRouter.patch("/:id", requireRoles(["admin", "project_manager"]), async (request, response, next) => {
  try {
    const oldValue = await prisma.task.findUnique({ where: { id: request.params.id }, include });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Задача не найдена");
    const task = await prisma.task.update({
      where: { id: request.params.id },
      data: {
        projectId: request.body.projectId === undefined ? undefined : requiredString(request.body.projectId, "projectId"),
        crmLeadId: request.body.crmLeadId === undefined ? undefined : optionalString(request.body.crmLeadId),
        title: request.body.title === undefined ? undefined : requiredString(request.body.title, "title"),
        description: request.body.description === undefined ? undefined : optionalString(request.body.description),
        responsibleUserId: request.body.responsibleUserId === undefined ? undefined : requiredString(request.body.responsibleUserId, "responsibleUserId"),
        statusId: request.body.statusId === undefined ? undefined : requiredString(request.body.statusId, "statusId"),
        priority: request.body.priority === undefined ? undefined : requiredString(request.body.priority, "priority"),
        plannedEndDate: request.body.plannedEndDate === undefined ? undefined : optionalDate(request.body.plannedEndDate),
        actualEndDate: request.body.actualEndDate === undefined ? undefined : optionalDate(request.body.actualEndDate),
        laborHours: request.body.laborHours === undefined ? undefined : optionalNumber(request.body.laborHours)
      },
      include
    });
    await writeAuditLog({ user: request.user, action: "update", entityType: "Task", entityId: task.id, oldValue, newValue: task });
    response.json({ data: task });
  } catch (error) {
    next(error);
  }
});

tasksRouter.delete("/:id", requireRoles(["admin", "project_manager"]), async (request, response, next) => {
  try {
    const oldValue = await prisma.task.findUnique({ where: { id: request.params.id }, include });
    if (!oldValue) throw new ApiError(404, "NOT_FOUND", "Задача не найдена");
    await prisma.task.delete({ where: { id: request.params.id } });
    await writeAuditLog({ user: request.user, action: "delete", entityType: "Task", entityId: request.params.id, oldValue });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
