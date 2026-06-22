import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "./api";
import type { DictionaryItem } from "./types";

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: unknown;
  newValue: unknown;
  createdAt: string;
  user: { id: string; fullName: string; email: string } | null;
};

const actions = ["create", "update", "delete", "login", "import", "export"];

export function AuditPage({ token }: { token: string | null }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<DictionaryItem[]>([]);
  const [filters, setFilters] = useState({ userId: "", action: "", entityType: "", dateFrom: "", dateTo: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadLogs() {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const query = params.toString() ? `?${params}` : "";
      const response = await apiRequest<{ data: AuditLog[] }>(`/audit-logs${query}`, {}, token);
      setLogs(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить журнал");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
    apiRequest<{ data: DictionaryItem[] }>("/users", {}, token)
      .then((response) => setUsers(response.data))
      .catch(() => undefined);
  }, [token]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadLogs();
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Журнал действий</p>
          <h1>Журнал действий</h1>
        </div>
      </div>

      <form className="dashboard-filters" onSubmit={handleSubmit}>
        <select value={filters.userId} onChange={(event) => setFilters({ ...filters, userId: event.target.value })}>
          <option value="">Все пользователи</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName as string}
            </option>
          ))}
        </select>
        <select value={filters.action} onChange={(event) => setFilters({ ...filters, action: event.target.value })}>
          <option value="">Все действия</option>
          {actions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
        <input placeholder="Сущность" value={filters.entityType} onChange={(event) => setFilters({ ...filters, entityType: event.target.value })} />
        <input type="date" value={filters.dateFrom} onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })} />
        <input type="date" value={filters.dateTo} onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })} />
        <button type="submit">Применить</button>
      </form>

      {error ? <div className="form-error">{error}</div> : null}
      {isLoading ? (
        <div className="state-box">Загрузка...</div>
      ) : logs.length === 0 ? (
        <div className="state-box">Записей журнала нет</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Пользователь</th>
                <th>Действие</th>
                <th>Сущность</th>
                <th>ID</th>
                <th>Значения</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString("ru-RU")}</td>
                  <td>{log.user?.fullName ?? "Система"}</td>
                  <td>{log.action}</td>
                  <td>{log.entityType}</td>
                  <td>{log.entityId ?? ""}</td>
                  <td>
                    <button type="button" className="secondary-button" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                      {expandedId === log.id ? "Скрыть" : "Показать"}
                    </button>
                    {expandedId === log.id ? (
                      <pre className="json-preview">{JSON.stringify({ oldValue: log.oldValue, newValue: log.newValue }, null, 2)}</pre>
                    ) : null}
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
