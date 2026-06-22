import { ReportType } from "@prisma/client";
import { prisma } from "../../prisma/client.js";

export type ReportResult = {
  columns: string[];
  rows: Array<Record<string, string | number>>;
};

type ReportFilters = {
  periodId?: string;
  clientId?: string;
  projectId?: string;
  responsibleUserId?: string;
  directionId?: string;
  statusId?: string;
  dateFrom?: string;
  dateTo?: string;
};

function asFilters(value: unknown): ReportFilters {
  if (!value || typeof value !== "object") return {};
  return value as ReportFilters;
}

function dateRange(filters: ReportFilters) {
  const from = filters.dateFrom ? new Date(filters.dateFrom) : undefined;
  const to = filters.dateTo ? new Date(filters.dateTo) : undefined;
  return from || to ? { gte: from, lte: to } : undefined;
}

function money(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value ?? 0);
}

function shortDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export async function buildReportData(type: ReportType, rawFilters: unknown): Promise<ReportResult> {
  const filters = asFilters(rawFilters);

  if (type === "projects") {
    const projects = await prisma.project.findMany({
      where: {
        id: filters.projectId,
        clientId: filters.clientId,
        responsibleUserId: filters.responsibleUserId,
        directionId: filters.directionId,
        statusId: filters.statusId,
        startDate: dateRange(filters)
      },
      include: { client: true, responsibleUser: true, direction: true, status: true },
      orderBy: { createdAt: "desc" }
    });

    return {
      columns: ["Проект", "Клиент", "Ответственный", "Направление", "Статус", "Дата начала", "План окончания", "Бюджет"],
      rows: projects.map((project) => ({
        "Проект": project.name,
        "Клиент": project.client.name,
        "Ответственный": project.responsibleUser.fullName,
        "Направление": project.direction.name,
        "Статус": project.status.name,
        "Дата начала": shortDate(project.startDate),
        "План окончания": shortDate(project.plannedEndDate),
        "Бюджет": money(project.budget)
      }))
    };
  }

  if (type === "tasks") {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: filters.projectId,
        responsibleUserId: filters.responsibleUserId,
        statusId: filters.statusId,
        plannedEndDate: dateRange(filters)
      },
      include: { project: true, responsibleUser: true, status: true },
      orderBy: { createdAt: "desc" }
    });

    return {
      columns: ["Задача", "Проект", "Ответственный", "Статус", "Приоритет", "План окончания", "Трудозатраты"],
      rows: tasks.map((task) => ({
        "Задача": task.title,
        "Проект": task.project.name,
        "Ответственный": task.responsibleUser.fullName,
        "Статус": task.status.name,
        "Приоритет": task.priority,
        "План окончания": shortDate(task.plannedEndDate),
        "Трудозатраты": task.laborHours ? money(task.laborHours) : ""
      }))
    };
  }

  if (type === "finance") {
    const values = await prisma.financialValue.findMany({
      where: {
        periodId: filters.periodId,
        projectId: filters.projectId,
        date: dateRange(filters),
        project: {
          clientId: filters.clientId,
          responsibleUserId: filters.responsibleUserId,
          directionId: filters.directionId
        }
      },
      include: { project: { include: { client: true } }, period: true, createdBy: true },
      orderBy: { date: "desc" }
    });

    return {
      columns: ["Проект", "Клиент", "Период", "Тип", "Сумма", "Дата", "Автор", "Комментарий"],
      rows: values.map((value) => ({
        "Проект": value.project.name,
        "Клиент": value.project.client.name,
        "Период": value.period.name,
        "Тип": value.type,
        "Сумма": money(value.amount),
        "Дата": shortDate(value.date),
        "Автор": value.createdBy.fullName,
        "Комментарий": value.comment ?? ""
      }))
    };
  }

  if (type === "clients") {
    const clients = await prisma.client.findMany({
      where: {
        id: filters.clientId,
        projects: filters.directionId || filters.responsibleUserId
          ? { some: { directionId: filters.directionId, responsibleUserId: filters.responsibleUserId } }
          : undefined
      },
      include: { projects: true },
      orderBy: { createdAt: "desc" }
    });

    return {
      columns: ["Клиент", "Контакт", "Телефон", "Email", "Источник", "Статус", "Проектов"],
      rows: clients.map((client) => ({
        "Клиент": client.name,
        "Контакт": client.contactPerson ?? "",
        "Телефон": client.phone ?? "",
        "Email": client.email ?? "",
        "Источник": client.source ?? "",
        "Статус": client.status ?? "",
        "Проектов": client.projects.length
      }))
    };
  }

  const projects = await prisma.project.findMany({
    where: {
      id: filters.projectId,
      clientId: filters.clientId,
      responsibleUserId: filters.responsibleUserId,
      directionId: filters.directionId
    },
    include: { status: true, tasks: { include: { status: true } }, financialValues: true },
    orderBy: { createdAt: "desc" }
  });

  return {
    columns: ["Показатель", "Значение"],
    rows: [
      { "Показатель": "Всего проектов", "Значение": projects.length },
      { "Показатель": "Активные проекты", "Значение": projects.filter((project) => project.status.code === "active").length },
      { "Показатель": "Завершенные проекты", "Значение": projects.filter((project) => project.status.isFinal).length },
      {
        "Показатель": "Всего задач",
        "Значение": projects.reduce((sum, project) => sum + project.tasks.length, 0)
      },
      {
        "Показатель": "Доходы",
        "Значение": projects.reduce(
          (sum, project) => sum + project.financialValues.filter((value) => value.type === "income").reduce((inner, value) => inner + money(value.amount), 0),
          0
        )
      },
      {
        "Показатель": "Расходы",
        "Значение": projects.reduce(
          (sum, project) => sum + project.financialValues.filter((value) => value.type === "expense").reduce((inner, value) => inner + money(value.amount), 0),
          0
        )
      }
    ]
  };
}

export function toCsv(result: ReportResult) {
  const escape = (value: string | number) => {
    const text = String(value ?? "");
    return /[",\n\r;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const lines = [result.columns.join(";")];
  for (const row of result.rows) {
    lines.push(result.columns.map((column) => escape(row[column] ?? "")).join(";"));
  }
  return `\uFEFF${lines.join("\r\n")}`;
}
