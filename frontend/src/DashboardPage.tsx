import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { apiRequest } from "./api";
import type { DictionaryItem } from "./types";

type DashboardData = {
  kpi: {
    activeProjectsCount: number;
    completedProjectsCount: number;
    overdueTasksCount: number;
    completedTasksPercent: number;
    plannedIncome: number;
    actualIncome: number;
    expenses: number;
    profit: number;
  };
  charts: {
    projectsByStatus: { name: string; value: number }[];
    tasksByStatus: { name: string; value: number }[];
    financeDynamicsByPeriod: { period: string; income: number; expenses: number }[];
    incomeExpenseComparison: { name: string; value: number }[];
    topClientsByRevenue: { clientId: string; name: string; revenue: number }[];
  };
  problemData: {
    overdueTasks: { id: string; title: string; project: string; responsibleUser: string; plannedEndDate: string; status: string }[];
    projectsNearDeadline: { id: string; name: string; client: string; plannedEndDate: string; status: string }[];
    projectsWithNegativeProfit: { id: string; name: string; client: string; income: number; expenses: number; profit: number }[];
  };
};

type Filters = {
  periodId: string;
  dateFrom: string;
  dateTo: string;
  clientId: string;
  projectId: string;
  responsibleUserId: string;
  directionId: string;
};

const chartColors = ["#c8102e", "#1f7a4d", "#f59e0b", "#334155", "#7c3aed"];
const emptyFilters: Filters = {
  periodId: "",
  dateFrom: "",
  dateTo: "",
  clientId: "",
  projectId: "",
  responsibleUserId: "",
  directionId: ""
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value) + " ₽";
}

function shortDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function buildQuery(filters: Filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString() ? `?${params}` : "";
}

export function DashboardPage({ token }: { token: string | null }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [lookups, setLookups] = useState<Record<string, DictionaryItem[]>>({
    periods: [],
    clients: [],
    projects: [],
    users: [],
    directions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo(() => buildQuery(filters), [filters]);

  async function loadDashboard(nextFilters = filters) {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiRequest<DashboardData>(`/analytics/dashboard${buildQuery(nextFilters)}`, {}, token);
      setData(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([
      apiRequest<{ data: DictionaryItem[] }>("/references/periods", {}, token),
      apiRequest<{ data: DictionaryItem[] }>("/clients", {}, token),
      apiRequest<{ data: DictionaryItem[] }>("/projects", {}, token),
      apiRequest<{ data: DictionaryItem[] }>("/users", {}, token),
      apiRequest<{ data: DictionaryItem[] }>("/references/directions", {}, token)
    ])
      .then(([periods, clients, projects, users, directions]) => {
        setLookups({
          periods: periods.data,
          clients: clients.data,
          projects: projects.data,
          users: users.data,
          directions: directions.data
        });
      })
      .catch((lookupError) => {
        setError(lookupError instanceof Error ? lookupError.message : "Не удалось загрузить фильтры");
      });
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [token]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadDashboard(filters);
  }

  const kpiCards = data
    ? [
        { title: "Активные проекты", value: data.kpi.activeProjectsCount, to: "/projects?status=active" },
        { title: "Завершенные проекты", value: data.kpi.completedProjectsCount, to: "/projects?status=completed" },
        { title: "Просроченные задачи", value: data.kpi.overdueTasksCount, to: "/tasks?overdue=true" },
        { title: "Выполнение задач", value: `${data.kpi.completedTasksPercent}%` },
        { title: "Плановый доход", value: formatMoney(data.kpi.plannedIncome), to: `/finance${query}` },
        { title: "Фактический доход", value: formatMoney(data.kpi.actualIncome), to: `/finance${query}` },
        { title: "Расходы", value: formatMoney(data.kpi.expenses), to: `/finance${query}` },
        { title: "Прибыль", value: formatMoney(data.kpi.profit), to: `/finance${query}` }
      ]
    : [];

  return (
    <section className="page dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1>Аналитическая панель</h1>
        </div>
      </div>

      <form className="dashboard-filters" onSubmit={handleSubmit}>
        <select value={filters.periodId} onChange={(event) => setFilters({ ...filters, periodId: event.target.value })}>
          <option value="">Все периоды</option>
          {lookups.periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name}
            </option>
          ))}
        </select>
        <input type="date" value={filters.dateFrom} onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })} />
        <input type="date" value={filters.dateTo} onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })} />
        <select value={filters.clientId} onChange={(event) => setFilters({ ...filters, clientId: event.target.value })}>
          <option value="">Все клиенты</option>
          {lookups.clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <select value={filters.projectId} onChange={(event) => setFilters({ ...filters, projectId: event.target.value })}>
          <option value="">Все проекты</option>
          {lookups.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <select value={filters.responsibleUserId} onChange={(event) => setFilters({ ...filters, responsibleUserId: event.target.value })}>
          <option value="">Все ответственные</option>
          {lookups.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName as string}
            </option>
          ))}
        </select>
        <select value={filters.directionId} onChange={(event) => setFilters({ ...filters, directionId: event.target.value })}>
          <option value="">Все направления</option>
          {lookups.directions.map((direction) => (
            <option key={direction.id} value={direction.id}>
              {direction.name}
            </option>
          ))}
        </select>
        <button type="submit">Применить</button>
      </form>

      {error ? <div className="form-error">{error}</div> : null}
      {isLoading ? <div className="state-box">Загрузка...</div> : null}

      {!isLoading && data ? (
        <>
          <div className="kpi-grid">
            {kpiCards.map((card) =>
              card.to ? (
                <Link className="kpi-card" key={card.title} to={card.to}>
                  <span>{card.title}</span>
                  <strong>{card.value}</strong>
                </Link>
              ) : (
                <div className="kpi-card" key={card.title}>
                  <span>{card.title}</span>
                  <strong>{card.value}</strong>
                </div>
              )
            )}
          </div>

          <div className="chart-grid">
            <div className="chart-panel">
              <h2>Проекты по статусам</h2>
              {data.charts.projectsByStatus.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.charts.projectsByStatus} dataKey="value" nameKey="name" outerRadius={92} label>
                      {data.charts.projectsByStatus.map((_, index) => (
                        <Cell key={index} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="state-box">Нет данных</div>
              )}
            </div>

            <div className="chart-panel">
              <h2>Задачи по статусам</h2>
              {data.charts.tasksByStatus.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.charts.tasksByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#c8102e" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="state-box">Нет данных</div>
              )}
            </div>

            <div className="chart-panel">
              <h2>Динамика финансов</h2>
              {data.charts.financeDynamicsByPeriod.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.charts.financeDynamicsByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="income" name="Доходы" stroke="#16a34a" />
                    <Line type="monotone" dataKey="expenses" name="Расходы" stroke="#ef4444" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="state-box">Нет данных</div>
              )}
            </div>

            <div className="chart-panel">
              <h2>Топ клиентов по выручке</h2>
              {data.charts.topClientsByRevenue.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.charts.topClientsByRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="state-box">Нет данных</div>
              )}
            </div>
          </div>

          <div className="problem-grid">
            <ProblemTable
              title="Просроченные задачи"
              emptyText="Просроченных задач нет"
              columns={["Задача", "Проект", "Ответственный", "Срок", "Статус"]}
              rows={data.problemData.overdueTasks.map((task) => [task.title, task.project, task.responsibleUser, shortDate(task.plannedEndDate), task.status])}
            />
            <ProblemTable
              title="Проблемные проекты"
              emptyText="Проблемных проектов нет"
              columns={["Проект", "Клиент", "Доход", "Расходы", "Прибыль"]}
              rows={data.problemData.projectsWithNegativeProfit.map((project) => [
                project.name,
                project.client,
                formatMoney(project.income),
                formatMoney(project.expenses),
                formatMoney(project.profit)
              ])}
            />
            <ProblemTable
              title="Ближайшие дедлайны"
              emptyText="Ближайших дедлайнов нет"
              columns={["Проект", "Клиент", "Срок", "Статус"]}
              rows={data.problemData.projectsNearDeadline.map((project) => [project.name, project.client, shortDate(project.plannedEndDate), project.status])}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}

function ProblemTable({ title, emptyText, columns, rows }: { title: string; emptyText: string; columns: string[]; rows: string[][] }) {
  return (
    <div className="chart-panel">
      <h2>{title}</h2>
      {rows.length ? (
        <div className="table-wrap compact-table">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="state-box">{emptyText}</div>
      )}
    </div>
  );
}
