import { Children, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest } from "./api";

type LeadOpsSummary = {
  totals: {
    totalLeads: number;
    activeLeads: number;
    overdueActivities: number;
    leadsWithoutActivities: number;
    reportsSubmittedToday: number;
    reportsMissed: number;
    failedEvents: number;
    linkedClients: number;
    linkedProjects: number;
    linkedTasks: number;
    pipelineAmount: number | string;
  };
  byStage: Array<{ stageExternalId: string | null; stageName: string; count: number }>;
  recentSyncJobs: Array<{ id: string; jobType: string; status: string; createdAt: string; errorMessage?: string | null }>;
};

type LeadListItem = {
  id: string;
  externalId: string;
  title: string;
  stage?: { name: string } | null;
  assignedByName?: string | null;
  activities: Array<{ id: string }>;
};

type UnifiedTask = {
  id: string;
  source: "internal" | "bitrix";
  title: string;
  status: string;
  dueAt?: string | null;
  responsible?: string | null;
  project?: string | null;
  lead?: { id: string; title: string; externalId: string } | null;
};

type WorkerPlan = {
  id: string;
  workDate: string;
  status: string;
  generatedAt?: string | null;
  sentAt?: string | null;
  summary?: string | null;
};

type WorkerReport = {
  id: string;
  workDate: string;
  status: string;
  submittedAt?: string | null;
  summary?: string | null;
};

type Worker = {
  id: string;
  fullName: string;
  bitrixUserExternalId?: string | null;
  status: string;
  messengerAccounts: Array<{
    id: string;
    provider: string;
    isVerified: boolean;
    username?: string | null;
    externalChatId?: string | null;
    lastInboundAt?: string | null;
  }>;
  dailyPlans: WorkerPlan[];
  dailyReports: WorkerReport[];
};

type TelegramQueueItem = {
  id: string;
  status: string;
  recipientChatId?: string | null;
  text: string;
  attempts: number;
  nextAttemptAt?: string | null;
  sentAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  messengerAccount?: {
    username?: string | null;
    externalChatId?: string | null;
    worker?: { id: string; fullName: string; bitrixUserExternalId?: string | null } | null;
  } | null;
};

type BitrixQueueItem = {
  id: string;
  commandType: string;
  status: string;
  attempts: number;
  nextAttemptAt?: string | null;
  sentAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  lead?: { id: string; title: string; externalId: string } | null;
  activity?: { id: string; subject: string; deadline?: string | null } | null;
};

type IntegrationEvent = {
  id: string;
  provider: string;
  direction?: string;
  eventType: string;
  externalId?: string | null;
  status: string;
  createdAt: string;
  processedAt?: string | null;
  errorMessage?: string | null;
};

type SyncJob = {
  id: string;
  provider: string;
  jobType: string;
  status: string;
  createdAt: string;
  finishedAt?: string | null;
  errorMessage?: string | null;
};

type IntegrationStatus = {
  counters: {
    failedEvents: number;
    queuedTelegram: number;
    failedTelegram: number;
    queuedBitrix: number;
    failedBitrix: number;
  };
  syncJobs: SyncJob[];
  recentEvents: IntegrationEvent[];
  telegramQueue: TelegramQueueItem[];
  bitrixQueue: BitrixQueueItem[];
  recentErrors: IntegrationEvent[];
};

const statusText: Record<string, string> = {
  active: "Активен",
  blocked: "Заблокирован",
  queued: "В очереди",
  failed: "Ошибка",
  succeeded: "Выполнено",
  sent: "Отправлено",
  submitted: "Сдан",
  completed: "Завершен",
  missed: "Пропущен",
  pending: "Ожидает",
  draft: "Черновик",
  processed: "Обработано",
  received: "Получено",
  in_progress: "В работе",
  done: "Готово",
  postponed: "Перенесено"
};

const sourceText = {
  internal: "Внутренняя",
  bitrix: "Bitrix24"
} as const;

export function LeadOpsPage({ token }: { token: string | null }) {
  const [data, setData] = useState<LeadOpsSummary | null>(null);
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [tasks, setTasks] = useState<UnifiedTask[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionRunning, setIsActionRunning] = useState(false);

  async function load() {
    setIsLoading(true);
    setError("");
    try {
      const [summary, leadList, unifiedTasks, workerList, integrationStatus] = await Promise.all([
        apiRequest<LeadOpsSummary>("/leadops/analytics/summary", {}, token),
        apiRequest<{ items: LeadListItem[] }>("/leadops/leads?take=10", {}, token),
        apiRequest<{ items: UnifiedTask[] }>("/leadops/tasks/unified", {}, token),
        apiRequest<{ items: Worker[] }>("/leadops/workers", {}, token),
        apiRequest<IntegrationStatus>("/leadops/integrations/status", {}, token)
      ]);
      setData(summary);
      setLeads(leadList.items);
      setTasks(unifiedTasks.items.slice(0, 12));
      setWorkers(workerList.items);
      setIntegrations(integrationStatus);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить раздел лидов");
    } finally {
      setIsLoading(false);
    }
  }

  async function runAction(action: () => Promise<unknown>, fallbackMessage: string) {
    setError("");
    setIsActionRunning(true);
    try {
      await action();
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : fallbackMessage);
    } finally {
      setIsActionRunning(false);
    }
  }

  function runBitrixSync() {
    return runAction(
      () => apiRequest("/bitrix/sync", { method: "POST", body: JSON.stringify({}) }, token),
      "Не удалось запустить синхронизацию Bitrix24"
    );
  }

  function sendDailyPlans() {
    return runAction(
      () => apiRequest("/leadops/daily-plans/send", { method: "POST", body: JSON.stringify({}) }, token),
      "Не удалось поставить ежедневные планы в очередь"
    );
  }

  useEffect(() => {
    load();
  }, [token]);

  const latestPlans = useMemo(
    () =>
      workers
        .flatMap((worker) => worker.dailyPlans.map((plan) => ({ ...plan, worker })))
        .sort((a, b) => String(b.workDate).localeCompare(String(a.workDate)))
        .slice(0, 6),
    [workers]
  );

  const latestReports = useMemo(
    () =>
      workers
        .flatMap((worker) => worker.dailyReports.map((report) => ({ ...report, worker })))
        .sort((a, b) => String(b.workDate).localeCompare(String(a.workDate)))
        .slice(0, 6),
    [workers]
  );

  return (
    <section className="page dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Лиды</p>
          <h1>Работа с лидами</h1>
          <p>Bitrix24, задачи сотрудников, Telegram-отчеты и контроль обработки.</p>
        </div>
        <div className="table-actions">
          <button type="button" onClick={runBitrixSync} disabled={isActionRunning}>
            Синхронизировать Bitrix24
          </button>
          <button type="button" onClick={sendDailyPlans} disabled={isActionRunning}>
            Отправить планы на день
          </button>
        </div>
      </div>

      {error ? <div className="form-error">{error}</div> : null}
      {isLoading ? <div className="state-box">Загрузка...</div> : null}

      {!isLoading && data ? (
        <>
          <div className="kpi-grid">
            <Kpi title="Всего лидов" value={data.totals.totalLeads} />
            <Kpi title="Активные лиды" value={data.totals.activeLeads} />
            <Kpi title="Просроченные дела" value={data.totals.overdueActivities} />
            <Kpi title="Без следующего действия" value={data.totals.leadsWithoutActivities} />
            <Kpi title="Отчеты сегодня" value={data.totals.reportsSubmittedToday} />
            <Kpi title="Пропущенные отчеты" value={data.totals.reportsMissed} />
            <Kpi title="Ошибки интеграций" value={data.totals.failedEvents} />
            <Kpi title="Связанные клиенты" value={data.totals.linkedClients} />
            <Kpi title="Связанные проекты" value={data.totals.linkedProjects} />
            <Kpi title="Связанные задачи" value={data.totals.linkedTasks} />
            <Kpi title="Сумма pipeline" value={formatMoney(data.totals.pipelineAmount)} />
          </div>

          <div className="chart-grid">
            <div className="chart-panel">
              <h2>Последние лиды</h2>
              {leads.length ? (
                <div className="table-wrap compact-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Лид</th>
                        <th>Стадия</th>
                        <th>Ответственный</th>
                        <th>Открытые дела</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id}>
                          <td>
                            <Link className="table-link" to={`/leadops/leads/${lead.id}`}>
                              {lead.title}
                            </Link>
                          </td>
                          <td>{lead.stage?.name ?? ""}</td>
                          <td>{lead.assignedByName ?? ""}</td>
                          <td>{lead.activities.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="state-box">Данных CRM пока нет</div>
              )}
            </div>

            <div className="chart-panel">
              <h2>Лиды по стадиям</h2>
              {data.byStage.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.byStage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stageName" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#c8102e" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="state-box">Данных CRM пока нет</div>
              )}
            </div>

            <div className="chart-panel">
              <h2>Последние синхронизации Bitrix24</h2>
              {data.recentSyncJobs.length ? (
                <div className="table-wrap compact-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Тип</th>
                        <th>Статус</th>
                        <th>Создано</th>
                        <th>Ошибка</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentSyncJobs.map((job) => (
                        <tr key={job.id}>
                          <td>{job.jobType}</td>
                          <td>
                            <StatusBadge status={job.status} />
                          </td>
                          <td>{formatDateTime(job.createdAt)}</td>
                          <td>{job.errorMessage ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="state-box">Синхронизаций пока нет</div>
              )}
            </div>

            <div className="chart-panel">
              <h2>Единые задачи</h2>
              {tasks.length ? (
                <div className="table-wrap compact-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Источник</th>
                        <th>Задача</th>
                        <th>Лид</th>
                        <th>Статус</th>
                        <th>Срок</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={`${task.source}-${task.id}`}>
                          <td>{sourceText[task.source]}</td>
                          <td>{task.title}</td>
                          <td>
                            {task.lead ? (
                              <Link className="table-link" to={`/leadops/leads/${task.lead.id}`}>
                                {task.lead.title}
                              </Link>
                            ) : (
                              ""
                            )}
                          </td>
                          <td>
                            <StatusBadge status={task.status} />
                          </td>
                          <td>{task.dueAt ? formatDate(task.dueAt) : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="state-box">Задач пока нет</div>
              )}
            </div>
          </div>

          <IntegrationWorkspace
            workers={workers}
            latestPlans={latestPlans}
            latestReports={latestReports}
            integrations={integrations}
            reportsMissed={data.totals.reportsMissed}
          />
        </>
      ) : null}
    </section>
  );
}

function IntegrationWorkspace({
  workers,
  latestPlans,
  latestReports,
  integrations,
  reportsMissed
}: {
  workers: Worker[];
  latestPlans: Array<WorkerPlan & { worker: Worker }>;
  latestReports: Array<WorkerReport & { worker: Worker }>;
  integrations: IntegrationStatus | null;
  reportsMissed: number;
}) {
  if (!integrations) {
    return <div className="state-box">Данных по интеграциям пока нет</div>;
  }

  const totalTelegramQueue = integrations.counters.queuedTelegram + integrations.counters.failedTelegram;
  const totalBitrixQueue = integrations.counters.queuedBitrix + integrations.counters.failedBitrix;

  return (
    <section className="integration-workspace" aria-labelledby="integration-heading">
      <div className="ops-heading">
        <div>
          <p className="eyebrow">Внешние сотрудники и интеграции</p>
          <h2 id="integration-heading">Контроль обмена и исполнительской дисциплины</h2>
          <p>Планы, отчеты, очереди сообщений, команды Bitrix24, события и ошибки собраны в одном представлении.</p>
        </div>
        <div className="ops-health">
          <StatusBadge status={integrations.counters.failedEvents ? "failed" : "succeeded"} />
          <span>{formatDateTime(new Date().toISOString())}</span>
        </div>
      </div>

      <div className="ops-metrics">
        <MetricCard label="Сотрудники" value={workers.length} tone="neutral" detail="Telegram и Bitrix24 связки" />
        <MetricCard label="Telegram очередь" value={totalTelegramQueue} tone={totalTelegramQueue ? "warning" : "success"} detail={`${integrations.counters.failedTelegram} ошибок`} />
        <MetricCard label="Bitrix24 очередь" value={totalBitrixQueue} tone={totalBitrixQueue ? "warning" : "success"} detail={`${integrations.counters.failedBitrix} ошибок`} />
        <MetricCard label="Ошибки событий" value={integrations.counters.failedEvents} tone={integrations.counters.failedEvents ? "danger" : "success"} detail="Webhook и обработчики" />
        <MetricCard label="Пропущенные отчеты" value={reportsMissed} tone={reportsMissed ? "danger" : "success"} detail="Контроль ежедневных отчетов" />
      </div>

      <div className="worker-cards">
        {workers.map((worker) => {
          const telegram = worker.messengerAccounts.find((account) => account.provider === "telegram");
          const lastPlan = worker.dailyPlans[0];
          const lastReport = worker.dailyReports[0];

          return (
            <article className="worker-card" key={worker.id}>
              <div className="worker-card__top">
                <div>
                  <h3>{worker.fullName}</h3>
                  <span>{worker.bitrixUserExternalId ?? "Bitrix24 не указан"}</span>
                </div>
                <StatusBadge status={worker.status} />
              </div>
              <div className="worker-card__messenger">
                <span>Telegram</span>
                <strong>{telegram?.isVerified ? telegram.username ?? telegram.externalChatId ?? "привязан" : "не привязан"}</strong>
              </div>
              <div className="worker-card__timeline">
                <TimelinePoint title="Последний план" value={lastPlan ? `${formatDate(lastPlan.workDate)} · ${statusText[lastPlan.status] ?? lastPlan.status}` : "Нет планов"} tone={lastPlan?.status} />
                <TimelinePoint title="Последний отчет" value={lastReport ? `${formatDate(lastReport.workDate)} · ${statusText[lastReport.status] ?? lastReport.status}` : "Нет отчетов"} tone={lastReport?.status} />
              </div>
            </article>
          );
        })}
      </div>

      <div className="exchange-grid">
        <OperationsPanel title="Последние планы" empty="Планов пока нет">
          {latestPlans.map((plan) => (
            <CompactRow key={plan.id} title={plan.worker.fullName} meta={formatDate(plan.workDate)} description={plan.summary ?? "План работы по лидам"} status={plan.status} />
          ))}
        </OperationsPanel>

        <OperationsPanel title="Последние отчеты" empty="Отчетов пока нет">
          {latestReports.map((report) => (
            <CompactRow key={report.id} title={report.worker.fullName} meta={formatDate(report.workDate)} description={report.summary ?? "Отчет сотрудника"} status={report.status} />
          ))}
        </OperationsPanel>

        <OperationsPanel title="Очередь Telegram" empty="Очередь Telegram пуста">
          {integrations.telegramQueue.map((item) => (
            <CompactRow
              key={item.id}
              title={item.messengerAccount?.worker?.fullName ?? item.recipientChatId ?? "Telegram"}
              meta={`${item.attempts} попыток · ${item.nextAttemptAt ? formatDateTime(item.nextAttemptAt) : formatDateTime(item.createdAt)}`}
              description={item.errorMessage ?? trimText(item.text, 94)}
              status={item.status}
            />
          ))}
        </OperationsPanel>

        <OperationsPanel title="Команды Bitrix24" empty="Очередь Bitrix24 пуста">
          {integrations.bitrixQueue.map((item) => (
            <CompactRow
              key={item.id}
              title={item.lead?.title ?? item.commandType}
              meta={`${item.commandType} · ${item.attempts} попыток`}
              description={item.errorMessage ?? item.activity?.subject ?? "Команда ожидает обработки"}
              status={item.status}
              link={item.lead ? `/leadops/leads/${item.lead.id}` : undefined}
            />
          ))}
        </OperationsPanel>
      </div>

      <div className="event-grid">
        <TablePanel title="Последние события обмена">
          <thead>
            <tr>
              <th>Провайдер</th>
              <th>Событие</th>
              <th>Статус</th>
              <th>Создано</th>
            </tr>
          </thead>
          <tbody>
            {integrations.recentEvents.slice(0, 10).map((event) => (
              <tr key={event.id}>
                <td>{event.provider}</td>
                <td>{event.eventType}</td>
                <td>
                  <StatusBadge status={event.status} />
                </td>
                <td>{formatDateTime(event.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </TablePanel>

        <TablePanel title="Ошибки и сбои">
          <thead>
            <tr>
              <th>Провайдер</th>
              <th>Событие</th>
              <th>Ошибка</th>
              <th>Создано</th>
            </tr>
          </thead>
          <tbody>
            {integrations.recentErrors.map((event) => (
              <tr key={event.id}>
                <td>{event.provider}</td>
                <td>{event.eventType}</td>
                <td>{event.errorMessage ?? "Ошибка обработки"}</td>
                <td>{formatDateTime(event.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </TablePanel>
      </div>
    </section>
  );
}

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="kpi-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricCard({ label, value, detail, tone }: { label: string; value: number | string; detail: string; tone: "neutral" | "success" | "warning" | "danger" }) {
  return (
    <div className={`ops-metric ops-metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function TimelinePoint({ title, value, tone }: { title: string; value: string; tone?: string }) {
  return (
    <div className="timeline-point">
      <span className={`timeline-dot status-dot--${statusTone(tone)}`} />
      <div>
        <small>{title}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function OperationsPanel({ title, empty, children }: { title: string; empty: string; children: ReactNode }) {
  const itemCount = Children.count(children);

  return (
    <section className="operations-panel">
      <h3>{title}</h3>
      {itemCount ? <div className="compact-rows">{children}</div> : <div className="mini-empty">{empty}</div>}
    </section>
  );
}

function CompactRow({ title, meta, description, status, link }: { title: string; meta: string; description: string; status: string; link?: string }) {
  const titleNode = link ? (
    <Link className="inline-link" to={link}>
      {title}
    </Link>
  ) : (
    <strong>{title}</strong>
  );

  return (
    <div className="compact-row">
      <div>
        {titleNode}
        <span>{meta}</span>
        <p>{description}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function TablePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="operations-panel table-panel">
      <h3>{title}</h3>
      <div className="table-wrap compact-table">
        <table>{children}</table>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-badge--${statusTone(status)}`}>{statusText[status] ?? status}</span>;
}

function statusTone(status?: string) {
  if (!status) return "neutral";
  if (["failed", "missed", "blocked"].includes(status)) return "danger";
  if (["queued", "pending", "draft", "sent", "in_progress", "postponed", "received"].includes(status)) return "warning";
  if (["succeeded", "submitted", "completed", "done", "processed", "active"].includes(status)) return "success";
  return "neutral";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatMoney(value: number | string) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Number(value));
}

function trimText(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 1)}...` : value;
}
