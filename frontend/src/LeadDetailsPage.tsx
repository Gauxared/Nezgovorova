import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "./api";

type Named = { id: string; name?: string; title?: string; fullName?: string; status?: string };

type LeadDetails = {
  id: string;
  externalId: string;
  title: string;
  lifecycleStatus: string;
  amount?: string | number | null;
  currency?: string | null;
  source?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  assignedByName?: string | null;
  assignedByExternalId?: string | null;
  lastSyncedAt?: string | null;
  stage?: { name: string; color?: string | null; semantic?: string | null } | null;
  activities: Array<Named & { subject: string; completed: boolean; deadline?: string | null; responsibleName?: string | null }>;
  clients: Array<Named & { contactPerson?: string | null; phone?: string | null; email?: string | null }>;
  projects: Array<Named & { responsibleUser?: { fullName: string }; status?: { name: string } }>;
  tasks: Array<Named & { project?: { name: string }; responsibleUser?: { fullName: string }; status?: { name: string } }>;
  reportItems: Array<{ id: string; status: string; comment?: string | null; report: { workDate: string; worker: { fullName: string } }; activity?: { subject: string } | null }>;
  outboundCommands: Array<{ id: string; commandType: string; status: string; createdAt: string; errorMessage?: string | null }>;
  integrationEvents: Array<{ id: string; eventType: string; status: string; createdAt: string; errorMessage?: string | null }>;
};

function shortDate(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function LeadDetailsPage({ token }: { token: string | null }) {
  const { id } = useParams();
  const [lead, setLead] = useState<LeadDetails | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError("");
    apiRequest<{ data: LeadDetails }>(`/leadops/leads/${id}`, {}, token)
      .then((response) => setLead(response.data))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить лид"))
      .finally(() => setIsLoading(false));
  }, [id, token]);

  if (isLoading) {
    return (
      <section className="page">
        <div className="state-box">Загрузка...</div>
      </section>
    );
  }

  if (error || !lead) {
    return (
      <section className="page">
        <div className="form-error">{error || "Лид не найден"}</div>
      </section>
    );
  }

  return (
    <section className="page dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Лид #{lead.externalId}</p>
          <h1>{lead.title}</h1>
          <p>{lead.stage?.name ?? "Без стадии"} | {lead.lifecycleStatus} | синхронизация {shortDate(lead.lastSyncedAt)}</p>
        </div>
        <Link className="primary-action" to="/leadops">
          Назад к лидам
        </Link>
      </div>

      <div className="kpi-grid">
        <Info title="Контакт" value={[lead.contactName, lead.contactPhone, lead.contactEmail].filter(Boolean).join(" | ") || "Контакт не указан"} />
        <Info title="Ответственный" value={lead.assignedByName ?? lead.assignedByExternalId ?? "Не назначен"} />
        <Info title="Источник" value={lead.source ?? "Источник не указан"} />
        <Info title="Сумма" value={lead.amount ? `${lead.amount} ${lead.currency ?? ""}` : "Сумма не указана"} />
      </div>

      <div className="chart-grid">
        <Table title="CRM-дела" columns={["Тема", "Срок", "Статус", "Ответственный"]} rows={lead.activities.map((item) => [item.subject, shortDate(item.deadline), item.completed ? "завершено" : "открыто", item.responsibleName ?? ""])} />
        <Table title="Связанные клиенты" columns={["Название", "Контакт", "Телефон", "Email"]} rows={lead.clients.map((item) => [item.name ?? "", item.contactPerson ?? "", item.phone ?? "", item.email ?? ""])} />
        <Table title="Связанные проекты" columns={["Проект", "Статус", "Ответственный"]} rows={lead.projects.map((item) => [item.name ?? "", item.status?.name ?? "", item.responsibleUser?.fullName ?? ""])} />
        <Table title="Внутренние задачи" columns={["Задача", "Проект", "Статус", "Ответственный"]} rows={lead.tasks.map((item) => [item.title ?? "", item.project?.name ?? "", item.status?.name ?? "", item.responsibleUser?.fullName ?? ""])} />
        <Table title="Telegram-отчеты" columns={["Сотрудник", "Дата", "Статус", "Комментарий"]} rows={lead.reportItems.map((item) => [item.report.worker.fullName, shortDate(item.report.workDate), item.status, item.comment ?? ""])} />
        <Table title="История интеграций" columns={["Тип", "Статус", "Создано", "Ошибка"]} rows={[...lead.integrationEvents.map((item) => [item.eventType, item.status, item.createdAt.slice(0, 16).replace("T", " "), item.errorMessage ?? ""]), ...lead.outboundCommands.map((item) => [item.commandType, item.status, item.createdAt.slice(0, 16).replace("T", " "), item.errorMessage ?? ""])]} />
      </div>
    </section>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="kpi-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Table({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) {
  return (
    <div className="chart-panel">
      <h2>{title}</h2>
      {rows.length ? (
        <div className="table-wrap compact-table">
          <table>
            <thead>
              <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="state-box">Данных пока нет</div>
      )}
    </div>
  );
}
