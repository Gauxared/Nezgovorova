import { Router } from "express";
import { ApiError } from "../../common/api-error.js";
import { writeAuditLog } from "../../common/audit.js";
import { optionalString, requiredString } from "../../common/validation.js";
import { prisma } from "../../prisma/client.js";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";

export const clientsRouter = Router();
const include = { crmLead: { select: { id: true, title: true, externalId: true } } };

clientsRouter.use(requireAuth);

clientsRouter.get("/", requireRoles(["admin", "client_manager", "project_manager", "director", "analyst"]), async (request, response, next) => {
  try {
    const search = typeof request.query.search === "string" ? request.query.search : undefined;
    const status = typeof request.query.status === "string" ? request.query.status : undefined;
    const clients = await prisma.client.findMany({
      where: {
        status: status || undefined,
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { contactPerson: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          : undefined
      },
      include,
      orderBy: { createdAt: "desc" }
    });

    response.json({ data: clients });
  } catch (error) {
    next(error);
  }
});

clientsRouter.get("/:id", requireRoles(["admin", "client_manager", "project_manager", "director", "analyst"]), async (request, response, next) => {
  try {
    const client = await prisma.client.findUnique({ where: { id: request.params.id }, include });
    if (!client) {
      throw new ApiError(404, "NOT_FOUND", "Клиент не найден");
    }

    response.json({ data: client });
  } catch (error) {
    next(error);
  }
});

clientsRouter.post("/", requireRoles(["admin", "client_manager"]), async (request, response, next) => {
  try {
    const client = await prisma.client.create({
      data: {
        name: requiredString(request.body.name, "name"),
        contactPerson: optionalString(request.body.contactPerson),
        phone: optionalString(request.body.phone),
        email: optionalString(request.body.email),
        source: optionalString(request.body.source),
        status: optionalString(request.body.status) ?? "active",
        crmLeadId: optionalString(request.body.crmLeadId)
      },
      include
    });
    await writeAuditLog({ user: request.user, action: "create", entityType: "Client", entityId: client.id, newValue: client });
    response.status(201).json({ data: client });
  } catch (error) {
    next(error);
  }
});

clientsRouter.patch("/:id", requireRoles(["admin", "client_manager"]), async (request, response, next) => {
  try {
    const oldValue = await prisma.client.findUnique({ where: { id: request.params.id }, include });
    if (!oldValue) {
      throw new ApiError(404, "NOT_FOUND", "Клиент не найден");
    }

    const client = await prisma.client.update({
      where: { id: request.params.id },
      data: {
        name: request.body.name === undefined ? undefined : requiredString(request.body.name, "name"),
        contactPerson: request.body.contactPerson === undefined ? undefined : optionalString(request.body.contactPerson),
        phone: request.body.phone === undefined ? undefined : optionalString(request.body.phone),
        email: request.body.email === undefined ? undefined : optionalString(request.body.email),
        source: request.body.source === undefined ? undefined : optionalString(request.body.source),
        status: request.body.status === undefined ? undefined : optionalString(request.body.status),
        crmLeadId: request.body.crmLeadId === undefined ? undefined : optionalString(request.body.crmLeadId)
      },
      include
    });
    await writeAuditLog({ user: request.user, action: "update", entityType: "Client", entityId: client.id, oldValue, newValue: client });
    response.json({ data: client });
  } catch (error) {
    next(error);
  }
});

clientsRouter.delete("/:id", requireRoles(["admin", "client_manager"]), async (request, response, next) => {
  try {
    const oldValue = await prisma.client.findUnique({ where: { id: request.params.id }, include });
    if (!oldValue) {
      throw new ApiError(404, "NOT_FOUND", "Клиент не найден");
    }

    await prisma.client.delete({ where: { id: request.params.id } });
    await writeAuditLog({ user: request.user, action: "delete", entityType: "Client", entityId: request.params.id, oldValue });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
