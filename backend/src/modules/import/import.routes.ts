import multer from "multer";
import { FinancialValueType } from "@prisma/client";
import { Router } from "express";
import { ApiError } from "../../common/api-error.js";
import { writeAuditLog } from "../../common/audit.js";
import { parseCsv, type CsvRow } from "../../common/csv.js";
import { prisma } from "../../prisma/client.js";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";

type ImportError = {
  line: number;
  message: string;
};

type ImportResult = {
  imported: number;
  errors: ImportError[];
};

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

export const importRouter = Router();

importRouter.use(requireAuth, requireRoles(["admin", "analyst"]));

function requireFile(file?: Express.Multer.File) {
  if (!file) {
    throw new ApiError(400, "VALIDATION_ERROR", "Загрузите CSV-файл в поле file");
  }

  return parseCsv(file.buffer);
}

function hasColumns(row: CsvRow, columns: string[], errors: ImportError[]) {
  const missing = columns.filter((column) => !(column in row.values));
  if (missing.length) {
    errors.push({ line: row.line, message: `Отсутствуют колонки: ${missing.join(", ")}` });
    return false;
  }
  return true;
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function runImport(entityType: string, userId: string | undefined, importTask: () => Promise<ImportResult>) {
  const result = await importTask();
  await writeAuditLog({
    user: userId ? { id: userId } : undefined,
    action: "import",
    entityType,
    newValue: result
  });
  return result;
}

importRouter.post("/clients", upload.single("file"), async (request, response, next) => {
  try {
    const rows = requireFile(request.file);
    const errors: ImportError[] = [];
    let imported = 0;
    const requiredColumns = ["name"];

    const result = await runImport("Client", request.user?.id, async () => {
      for (const row of rows) {
        if (!hasColumns(row, requiredColumns, errors)) continue;
        if (!row.values.name) {
          errors.push({ line: row.line, message: "name обязателен" });
          continue;
        }
        try {
          await prisma.client.create({
            data: {
              name: row.values.name,
              contactPerson: row.values.contactPerson || null,
              phone: row.values.phone || null,
              email: row.values.email || null,
              source: row.values.source || null,
              status: row.values.status || "active"
            }
          });
          imported += 1;
        } catch (error) {
          errors.push({ line: row.line, message: error instanceof Error ? error.message : "Ошибка импорта клиента" });
        }
      }
      return { imported, errors };
    });

    response.json(result);
  } catch (error) {
    next(error);
  }
});

importRouter.post("/projects", upload.single("file"), async (request, response, next) => {
  try {
    const rows = requireFile(request.file);
    const errors: ImportError[] = [];
    let imported = 0;
    const requiredColumns = ["name", "clientId", "responsibleUserId", "directionId", "statusId", "startDate", "budget"];

    const result = await runImport("Project", request.user?.id, async () => {
      for (const row of rows) {
        if (!hasColumns(row, requiredColumns, errors)) continue;
        const startDate = parseDate(row.values.startDate);
        if (!startDate) {
          errors.push({ line: row.line, message: "startDate должен быть датой" });
          continue;
        }
        try {
          await prisma.project.create({
            data: {
              name: row.values.name,
              clientId: row.values.clientId,
              responsibleUserId: row.values.responsibleUserId,
              directionId: row.values.directionId,
              statusId: row.values.statusId,
              startDate,
              plannedEndDate: row.values.plannedEndDate ? parseDate(row.values.plannedEndDate) : null,
              actualEndDate: row.values.actualEndDate ? parseDate(row.values.actualEndDate) : null,
              budget: row.values.budget,
              description: row.values.description || null
            }
          });
          imported += 1;
        } catch (error) {
          errors.push({ line: row.line, message: error instanceof Error ? error.message : "Ошибка импорта проекта" });
        }
      }
      return { imported, errors };
    });

    response.json(result);
  } catch (error) {
    next(error);
  }
});

importRouter.post("/tasks", upload.single("file"), async (request, response, next) => {
  try {
    const rows = requireFile(request.file);
    const errors: ImportError[] = [];
    let imported = 0;
    const requiredColumns = ["projectId", "title", "responsibleUserId", "statusId", "priority"];

    const result = await runImport("Task", request.user?.id, async () => {
      for (const row of rows) {
        if (!hasColumns(row, requiredColumns, errors)) continue;
        try {
          await prisma.task.create({
            data: {
              projectId: row.values.projectId,
              title: row.values.title,
              description: row.values.description || null,
              responsibleUserId: row.values.responsibleUserId,
              statusId: row.values.statusId,
              priority: row.values.priority,
              plannedEndDate: row.values.plannedEndDate ? parseDate(row.values.plannedEndDate) : null,
              actualEndDate: row.values.actualEndDate ? parseDate(row.values.actualEndDate) : null,
              laborHours: row.values.laborHours || null
            }
          });
          imported += 1;
        } catch (error) {
          errors.push({ line: row.line, message: error instanceof Error ? error.message : "Ошибка импорта задачи" });
        }
      }
      return { imported, errors };
    });

    response.json(result);
  } catch (error) {
    next(error);
  }
});

importRouter.post("/financial-values", upload.single("file"), async (request, response, next) => {
  try {
    const rows = requireFile(request.file);
    const errors: ImportError[] = [];
    let imported = 0;
    const requiredColumns = ["projectId", "periodId", "type", "amount", "date"];

    const result = await runImport("FinancialValue", request.user?.id, async () => {
      for (const row of rows) {
        if (!hasColumns(row, requiredColumns, errors)) continue;
        const date = parseDate(row.values.date);
        if (!date) {
          errors.push({ line: row.line, message: "date должен быть датой" });
          continue;
        }
        try {
          await prisma.financialValue.create({
            data: {
              projectId: row.values.projectId,
              periodId: row.values.periodId,
              type: row.values.type as FinancialValueType,
              amount: row.values.amount,
              comment: row.values.comment || null,
              date,
              createdById: request.user!.id
            }
          });
          imported += 1;
        } catch (error) {
          errors.push({ line: row.line, message: error instanceof Error ? error.message : "Ошибка импорта финансовой записи" });
        }
      }
      return { imported, errors };
    });

    response.json(result);
  } catch (error) {
    next(error);
  }
});
