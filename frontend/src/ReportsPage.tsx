import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL, apiRequest } from "./api";
import type { DictionaryItem } from "./types";

type ReportType = "projects" | "tasks" | "finance" | "clients" | "summary";

type Report = {
  id: string;
  title: string;
  description: string | null;
  type: ReportType;
  filters: Record<string, string>;
  createdAt: string;
  createdBy: { fullName: string };
};

type ReportDetails = Report & {
  result: {
    columns: string[];
    rows: Array<Record<string, string | number>>;
  };
};

const reportTypes: Array<{ value: ReportType; label: string }> = [
  { value: "projects", label: "Отчет по проектам" },
  { value: "tasks", label: "Отчет по задачам" },
  { value: "finance", label: "Финансовый отчет" },
  { value: "clients", label: "Отчет по клиентам" },
  { value: "summary", label: "Сводный управленческий отчет" }
];

const emptyForm = {
  title: "",
  description: "",
  type: "finance" as ReportType,
  periodId: "",
  clientId: "",
  projectId: "",
  responsibleUserId: "",
  directionId: "",
  statusId: "",
  dateFrom: "",
  dateTo: ""
};

function reportTypeLabel(type: ReportType) {
  return reportTypes.find((item) => item.value === type)?.label ?? type;
}

function clearEmptyFilters(form: typeof emptyForm) {
  const { title: _title, description: _description, type: _type, ...filters } = form;
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
}

export function ReportsPage({ token }: { token: string | null }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [lookups, setLookups] = useState<Record<string, DictionaryItem[]>>({
    periods: [],
    clients: [],
    projects: [],
    users: [],
    directions: [],
    statuses: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports() {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiRequest<{ data: Report[] }>("/reports", {}, token);
      setReports(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить отчеты");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    Promise.all([
      apiRequest<{ data: DictionaryItem[] }>("/references/periods", {}, token),
      apiRequest<{ data: DictionaryItem[] }>("/clients", {}, token),
      apiRequest<{ data: DictionaryItem[] }>("/projects", {}, token),
      apiRequest<{ data: DictionaryItem[] }>("/users", {}, token),
      apiRequest<{ data: DictionaryItem[] }>("/references/directions", {}, token),
      apiRequest<{ data: DictionaryItem[] }>("/references/statuses", {}, token)
    ])
      .then(([periods, clients, projects, users, directions, statuses]) => {
        setLookups({ periods: periods.data, clients: clients.data, projects: projects.data, users: users.data, directions: directions.data, statuses: statuses.data });
      })
      .catch((lookupError) => setError(lookupError instanceof Error ? lookupError.message : "Не удалось загрузить фильтры"));
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await apiRequest(
        "/reports",
        {
          method: "POST",
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            type: form.type,
            filters: clearEmptyFilters(form)
          })
        },
        token
      );
      setForm(emptyForm);
      await loadReports();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось создать отчет");
    }
  }

  async function handleDelete(report: Report) {
    if (!window.confirm("Удалить отчет?")) return;
    await apiRequest(`/reports/${report.id}`, { method: "DELETE" }, token);
    await loadReports();
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Отчеты</p>
          <h1>Отчеты</h1>
        </div>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <form className="entity-form" onSubmit={handleSubmit}>
        <label>
          Название
          <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </label>
        <label>
          Тип отчета
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ReportType })}>
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Описание
          <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <ReportFilterFields form={form} setForm={setForm} lookups={lookups} />
        <div className="form-actions">
          <button type="submit">Создать отчет</button>
        </div>
      </form>

      {isLoading ? (
        <div className="state-box">Загрузка...</div>
      ) : reports.length === 0 ? (
        <div className="state-box">Отчетов пока нет</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Автор</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.title}</td>
                  <td>{reportTypeLabel(report.type)}</td>
                  <td>{report.createdBy.fullName}</td>
                  <td>{report.createdAt.slice(0, 10)}</td>
                  <td className="table-actions">
                    <Link className="table-link" to={`/reports/${report.id}`}>
                      Открыть
                    </Link>
                    <button type="button" className="danger-button" onClick={() => handleDelete(report)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function ReportDetailsPage({ token }: { token: string | null }) {
  const { id } = useParams();
  const [report, setReport] = useState<ReportDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    apiRequest<{ data: ReportDetails }>(`/reports/${id}`, {}, token)
      .then((response) => setReport(response.data))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Не удалось открыть отчет"))
      .finally(() => setIsLoading(false));
  }, [id, token]);

  async function exportCsv() {
    const response = await fetch(`${API_URL}/reports/${id}/export?format=csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message ?? "Не удалось экспортировать отчет");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report?.title ?? "report"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="page">
      {isLoading ? <div className="state-box">Загрузка...</div> : null}
      {error ? <div className="form-error">{error}</div> : null}
      {report ? (
        <>
          <div className="page-heading">
            <div>
              <p className="eyebrow">{reportTypeLabel(report.type)}</p>
              <h1>{report.title}</h1>
              <p>{report.description}</p>
            </div>
            <button className="primary-action" type="button" onClick={() => exportCsv().catch((exportError) => setError(exportError.message))}>
              Экспорт CSV
            </button>
          </div>
          {report.result.rows.length === 0 ? (
            <div className="state-box">По выбранным фильтрам данных нет</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {report.result.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.result.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {report.result.columns.map((column) => (
                        <td key={column}>{row[column]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}

function ReportFilterFields({
  form,
  setForm,
  lookups
}: {
  form: typeof emptyForm;
  setForm: (form: typeof emptyForm) => void;
  lookups: Record<string, DictionaryItem[]>;
}) {
  return (
    <>
      <label>
        Период
        <select value={form.periodId} onChange={(event) => setForm({ ...form, periodId: event.target.value })}>
          <option value="">Все периоды</option>
          {lookups.periods.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Клиент
        <select value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })}>
          <option value="">Все клиенты</option>
          {lookups.clients.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Проект
        <select value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })}>
          <option value="">Все проекты</option>
          {lookups.projects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Ответственный
        <select value={form.responsibleUserId} onChange={(event) => setForm({ ...form, responsibleUserId: event.target.value })}>
          <option value="">Все ответственные</option>
          {lookups.users.map((item) => (
            <option key={item.id} value={item.id}>
              {item.fullName as string}
            </option>
          ))}
        </select>
      </label>
      <label>
        Направление
        <select value={form.directionId} onChange={(event) => setForm({ ...form, directionId: event.target.value })}>
          <option value="">Все направления</option>
          {lookups.directions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Статус
        <select value={form.statusId} onChange={(event) => setForm({ ...form, statusId: event.target.value })}>
          <option value="">Все статусы</option>
          {lookups.statuses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Дата с
        <input type="date" value={form.dateFrom} onChange={(event) => setForm({ ...form, dateFrom: event.target.value })} />
      </label>
      <label>
        Дата по
        <input type="date" value={form.dateTo} onChange={(event) => setForm({ ...form, dateTo: event.target.value })} />
      </label>
    </>
  );
}
