import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest } from "./api";
import type { AnyRecord, DictionaryItem } from "./types";

type OptionSource = "clients" | "projects" | "users" | "directions" | "projectStatuses" | "taskStatuses" | "periods" | "crmLeads";

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "date" | "number" | "textarea" | "select" | "checkbox";
  required?: boolean;
  min?: number;
  step?: number;
  options?: { value: string; label: string }[];
  source?: OptionSource;
};

type ColumnConfig = {
  key: string;
  label: string;
  render?: (item: AnyRecord) => string;
};

export type CrudConfig = {
  title: string;
  endpoint: string;
  searchPlaceholder?: string;
  fields: FieldConfig[];
  columns: ColumnConfig[];
};

type Lookups = Record<OptionSource, DictionaryItem[]>;

const emptyLookups: Lookups = {
  clients: [],
  projects: [],
  users: [],
  directions: [],
  projectStatuses: [],
  taskStatuses: [],
  periods: [],
  crmLeads: []
};

function formatDate(value: unknown) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function readValue(item: AnyRecord, key: string) {
  return key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, item);
}

function optionValue(option: DictionaryItem | { value: string; label: string }) {
  return "id" in option ? option.id : option.value;
}

function optionLabel(option: DictionaryItem | { value: string; label: string }) {
  if ("label" in option) {
    return option.label;
  }

  return String(option.name ?? option.fullName ?? option.email ?? option.code ?? option.id);
}

function initialForm(fields: FieldConfig[]) {
  return fields.reduce<Record<string, string | boolean>>((acc, field) => {
    acc[field.name] = field.type === "checkbox" ? false : "";
    return acc;
  }, {});
}

export function CrudPage({ config, token, readOnly = false }: { config: CrudConfig; token: string | null; readOnly?: boolean }) {
  const [items, setItems] = useState<AnyRecord[]>([]);
  const [lookups, setLookups] = useState<Lookups>(emptyLookups);
  const [form, setForm] = useState<Record<string, string | boolean>>(() => initialForm(config.fields));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fieldsWithSources = useMemo(() => config.fields.filter((field) => field.source), [config.fields]);

  async function loadItems() {
    setIsLoading(true);
    setError("");
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const response = await apiRequest<{ data: AnyRecord[] }>(`${config.endpoint}${query}`, {}, token);
      setItems(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить данные");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadLookups() {
    const requests: Partial<Record<OptionSource, Promise<DictionaryItem[]>>> = {};

    for (const field of fieldsWithSources) {
      if (!field.source || requests[field.source]) continue;
      const pathBySource: Record<OptionSource, string> = {
        clients: "/clients",
        projects: "/projects",
        users: "/users",
        directions: "/references/directions",
        projectStatuses: "/references/statuses?entityType=project",
        taskStatuses: "/references/statuses?entityType=task",
        periods: "/references/periods",
        crmLeads: "/leadops/lead-options"
      };
      requests[field.source] = apiRequest<{ data: DictionaryItem[] }>(pathBySource[field.source], {}, token).then((r) => r.data);
    }

    const nextLookups = { ...emptyLookups };
    await Promise.all(
      Object.entries(requests).map(async ([source, request]) => {
        nextLookups[source as OptionSource] = await request;
      })
    );
    setLookups(nextLookups);
  }

  useEffect(() => {
    loadItems();
  }, [config.endpoint]);

  useEffect(() => {
    loadLookups().catch((lookupError) => {
      setError(lookupError instanceof Error ? lookupError.message : "Не удалось загрузить справочники");
    });
  }, [config.endpoint]);

  function resetForm() {
    setForm(initialForm(config.fields));
    setEditingId(null);
  }

  function startEdit(item: AnyRecord) {
    const next = initialForm(config.fields);
    for (const field of config.fields) {
      const value = readValue(item, field.name);
      if (field.type === "date") {
        next[field.name] = formatDate(value);
      } else if (field.type === "checkbox") {
        next[field.name] = Boolean(value);
      } else {
        next[field.name] = value === null || value === undefined ? "" : String(value);
      }
    }
    setForm(next);
    setEditingId(item.id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const method = editingId ? "PATCH" : "POST";
      const path = editingId ? `${config.endpoint}/${editingId}` : config.endpoint;
      await apiRequest(path, { method, body: JSON.stringify(form) }, token);
      resetForm();
      await loadItems();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить данные");
    }
  }

  async function handleDelete(item: AnyRecord) {
    if (!window.confirm("Удалить запись?")) return;

    setError("");
    try {
      await apiRequest(`${config.endpoint}/${item.id}`, { method: "DELETE" }, token);
      await loadItems();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить данные");
    }
  }

  return (
    <section className="page crud-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Данные</p>
          <h1>{config.title}</h1>
        </div>
        <form
          className="search-form"
          onSubmit={(event) => {
            event.preventDefault();
            loadItems();
          }}
        >
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={config.searchPlaceholder ?? "Поиск"} />
          <button type="submit">Найти</button>
        </form>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      {!readOnly ? (
        <form className="entity-form" onSubmit={handleSubmit}>
          {config.fields.map((field) => (
            <label key={field.name}>
              {field.label}
              {field.type === "textarea" ? (
                <textarea value={String(form[field.name] ?? "")} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} />
              ) : field.type === "select" ? (
                <select
                  required={field.required}
                  value={String(form[field.name] ?? "")}
                  onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                >
                  <option value="">Выберите значение</option>
                  {(field.source ? lookups[field.source] : field.options ?? []).map((option) => (
                    <option key={String(optionValue(option))} value={String(optionValue(option))}>
                      {String(optionLabel(option))}
                    </option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <input
                  checked={Boolean(form[field.name])}
                  type="checkbox"
                  onChange={(event) => setForm({ ...form, [field.name]: event.target.checked })}
                />
              ) : (
                <input
                  min={field.min}
                  required={field.required}
                  step={field.step}
                  type={field.type ?? "text"}
                  value={String(form[field.name] ?? "")}
                  onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                />
              )}
            </label>
          ))}
          <div className="form-actions">
            <button type="submit">{editingId ? "Сохранить" : "Создать"}</button>
            {editingId ? (
              <button type="button" className="secondary-button" onClick={resetForm}>
                Отмена
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <div className="state-box">Загрузка...</div>
      ) : items.length === 0 ? (
        <div className="state-box">Нет данных</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                {!readOnly ? <th>Действия</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {config.columns.map((column) => (
                    <td key={column.key}>{column.render ? column.render(item) : String(readValue(item, column.key) ?? "")}</td>
                  ))}
                  {!readOnly ? (
                    <td className="table-actions">
                      <button type="button" onClick={() => startEdit(item)}>
                        Изменить
                      </button>
                      <button type="button" className="danger-button" onClick={() => handleDelete(item)}>
                        Удалить
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
