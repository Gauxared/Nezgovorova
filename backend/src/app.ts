import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { ApiError } from "./common/api-error.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { dashboardRouter } from "./modules/analytics/dashboard.routes.js";
import { auditRouter } from "./modules/audit/audit.routes.js";
import { bitrixRouter } from "./modules/bitrix/bitrix.routes.js";
import { clientsRouter } from "./modules/crud/clients.routes.js";
import { financialValuesRouter } from "./modules/crud/financial-values.routes.js";
import { projectsRouter } from "./modules/crud/projects.routes.js";
import { referencesRouter } from "./modules/crud/references.routes.js";
import { reportsRouter } from "./modules/reports/reports.routes.js";
import { importRouter } from "./modules/import/import.routes.js";
import { leadopsRouter } from "./modules/leadops/leadops.routes.js";
import { leadopsAnalyticsRouter } from "./modules/leadops/leadops.analytics.routes.js";
import { tasksRouter } from "./modules/crud/tasks.routes.js";
import { telegramRouter } from "./modules/telegram/telegram.routes.js";
import { usersRouter } from "./modules/crud/users.routes.js";
import { prisma } from "./prisma/client.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: [
        env.frontendUrl,
        "http://127.0.0.1:5175",
        "http://localhost:5175",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5173",
        "http://localhost:5173"
      ]
    })
  );
  app.use(express.json());

  app.get("/api/health", async (_request, response, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      response.json({ status: "ok", database: "connected" });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api/auth", authRouter);
  app.use("/api/analytics", dashboardRouter);
  app.use("/api/audit-logs", auditRouter);
  app.use("/api/bitrix", bitrixRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/clients", clientsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api/financial-values", financialValuesRouter);
  app.use("/api/references", referencesRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/import", importRouter);
  app.use("/api/leadops", leadopsRouter);
  app.use("/api/leadops/analytics", leadopsAnalyticsRouter);
  app.use("/api/telegram", telegramRouter);

  app.use((_request, response) => {
    response.status(404).json({
      message: "Route not found",
      code: "NOT_FOUND",
      details: {}
    });
  });

  app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;

    response.status(statusCode).json({
      message: error.message || "Internal server error",
      code: error instanceof ApiError ? error.code : "INTERNAL_SERVER_ERROR",
      details: error instanceof ApiError ? error.details : {}
    });
  });

  return app;
}
