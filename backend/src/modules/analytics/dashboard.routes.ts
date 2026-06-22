import { Router } from "express";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";
import { prisma } from "../../prisma/client.js";

export const dashboardRouter = Router();

type DashboardFilters = {
  periodId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  clientId?: string;
  projectId?: string;
  responsibleUserId?: string;
  directionId?: string;
};

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function numberValue(value: unknown) {
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value ?? 0);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

dashboardRouter.use(requireAuth, requireRoles(["admin", "director", "analyst"]));

dashboardRouter.get("/dashboard", async (request, response, next) => {
  try {
    const filters: DashboardFilters = {
      periodId: typeof request.query.periodId === "string" ? request.query.periodId : undefined,
      dateFrom: parseDate(request.query.dateFrom),
      dateTo: parseDate(request.query.dateTo),
      clientId: typeof request.query.clientId === "string" ? request.query.clientId : undefined,
      projectId: typeof request.query.projectId === "string" ? request.query.projectId : undefined,
      responsibleUserId: typeof request.query.responsibleUserId === "string" ? request.query.responsibleUserId : undefined,
      directionId: typeof request.query.directionId === "string" ? request.query.directionId : undefined
    };

    const projectWhere = {
      id: filters.projectId,
      clientId: filters.clientId,
      responsibleUserId: filters.responsibleUserId,
      directionId: filters.directionId,
      startDate: filters.dateFrom || filters.dateTo ? { gte: filters.dateFrom, lte: filters.dateTo } : undefined
    };

    const projects = await prisma.project.findMany({
      where: projectWhere,
      include: {
        client: true,
        status: true,
        tasks: { include: { status: true, responsibleUser: { select: { id: true, fullName: true } } } },
        financialValues: filters.periodId || filters.dateFrom || filters.dateTo
          ? {
              where: {
                periodId: filters.periodId,
                date: filters.dateFrom || filters.dateTo ? { gte: filters.dateFrom, lte: filters.dateTo } : undefined
              },
              include: { period: true }
            }
          : { include: { period: true } }
      }
    });

    const tasks = projects.flatMap((project) =>
      project.tasks.map((task) => ({
        ...task,
        project: { id: project.id, name: project.name, client: project.client }
      }))
    );
    const financialValues = projects.flatMap((project) =>
      project.financialValues.map((value) => ({
        ...value,
        project: { id: project.id, name: project.name, client: project.client }
      }))
    );

    const now = new Date();
    const activeProjects = projects.filter((project) => project.status.code === "active");
    const completedProjects = projects.filter((project) => project.status.code === "completed" || project.status.isFinal);
    const overdueTasks = tasks.filter((task) => task.plannedEndDate && task.plannedEndDate < now && !task.status.isFinal);
    const completedTasks = tasks.filter((task) => task.status.isFinal || task.status.code === "done");

    const sumByType = (types: string[]) =>
      financialValues.filter((value) => types.includes(value.type)).reduce((sum, value) => sum + numberValue(value.amount), 0);

    const plannedIncome = sumByType(["planned_income"]);
    const actualIncome = sumByType(["income"]);
    const expenses = sumByType(["expense", "planned_expense"]);
    const profit = actualIncome - sumByType(["expense"]);

    const projectsByStatus = Object.values(
      projects.reduce<Record<string, { name: string; value: number }>>((acc, project) => {
        acc[project.status.id] ??= { name: project.status.name, value: 0 };
        acc[project.status.id].value += 1;
        return acc;
      }, {})
    );

    const tasksByStatus = Object.values(
      tasks.reduce<Record<string, { name: string; value: number }>>((acc, task) => {
        acc[task.status.id] ??= { name: task.status.name, value: 0 };
        acc[task.status.id].value += 1;
        return acc;
      }, {})
    );

    const financeDynamicsByPeriod = Object.values(
      financialValues.reduce<Record<string, { period: string; income: number; expenses: number }>>((acc, value) => {
        const key = value.period?.name ?? monthKey(value.date);
        acc[key] ??= { period: key, income: 0, expenses: 0 };
        if (value.type === "income" || value.type === "planned_income") acc[key].income += numberValue(value.amount);
        if (value.type === "expense" || value.type === "planned_expense") acc[key].expenses += numberValue(value.amount);
        return acc;
      }, {})
    );

    const incomeExpenseComparison = [
      { name: "Плановый доход", value: plannedIncome },
      { name: "Фактический доход", value: actualIncome },
      { name: "Расходы", value: expenses },
      { name: "Прибыль", value: profit }
    ];

    const topClientsByRevenue = Object.values(
      financialValues
        .filter((value) => value.type === "income")
        .reduce<Record<string, { clientId: string; name: string; revenue: number }>>((acc, value) => {
          const client = value.project.client;
          acc[client.id] ??= { clientId: client.id, name: client.name, revenue: 0 };
          acc[client.id].revenue += numberValue(value.amount);
          return acc;
        }, {})
    )
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const projectsNearDeadline = projects
      .filter((project) => {
        if (!project.plannedEndDate || project.status.isFinal) return false;
        const daysLeft = Math.ceil((project.plannedEndDate.getTime() - now.getTime()) / 86_400_000);
        return daysLeft >= 0 && daysLeft <= 14;
      })
      .map((project) => ({
        id: project.id,
        name: project.name,
        plannedEndDate: project.plannedEndDate,
        status: project.status.name,
        client: project.client.name
      }));

    const projectsWithNegativeProfit = projects
      .map((project) => {
        const income = project.financialValues.filter((value) => value.type === "income").reduce((sum, value) => sum + numberValue(value.amount), 0);
        const projectExpenses = project.financialValues.filter((value) => value.type === "expense").reduce((sum, value) => sum + numberValue(value.amount), 0);
        return {
          id: project.id,
          name: project.name,
          client: project.client.name,
          income,
          expenses: projectExpenses,
          profit: income - projectExpenses
        };
      })
      .filter((project) => project.profit < 0);

    response.json({
      kpi: {
        activeProjectsCount: activeProjects.length,
        completedProjectsCount: completedProjects.length,
        overdueTasksCount: overdueTasks.length,
        completedTasksPercent: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
        plannedIncome,
        actualIncome,
        expenses,
        profit
      },
      charts: {
        projectsByStatus,
        tasksByStatus,
        financeDynamicsByPeriod,
        incomeExpenseComparison,
        topClientsByRevenue
      },
      problemData: {
        overdueTasks: overdueTasks.map((task) => ({
          id: task.id,
          title: task.title,
          project: task.project.name,
          responsibleUser: task.responsibleUser.fullName,
          plannedEndDate: task.plannedEndDate,
          status: task.status.name
        })),
        projectsNearDeadline,
        projectsWithNegativeProfit
      }
    });
  } catch (error) {
    next(error);
  }
});
