import { FormEvent, useState } from "react";
import { API_URL } from "./api";

const importTargets = [
  { value: "clients", label: "Клиенты", columns: "name;contactPerson;phone;email;source;status" },
  {
    value: "projects",
    label: "Проекты",
    columns: "name;clientId;responsibleUserId;directionId;statusId;startDate;plannedEndDate;actualEndDate;budget;description"
  },
  {
    value: "tasks",
    label: "Задачи",
    columns: "projectId;title;description;responsibleUserId;statusId;priority;plannedEndDate;actualEndDate;laborHours"
  },
  { value: "financial-values", label: "Финансовые записи", columns: "projectId;periodId;type;amount;date;comment" }
];

type ImportResult = {
  imported: number;
  errors: Array<{ line: number; message: string }>;
};

export function ImportPage({ token }: { token: string | null }) {
  const [target, setTarget] = useState(importTargets[0].value);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const currentTarget = importTargets.find((item) => item.value === target)!;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Выберите CSV-файл");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_URL}/import/${target}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Не удалось импортировать CSV");
      }
      setResult(data);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Не удалось импортировать CSV");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Импорт CSV</p>
          <h1>Импорт CSV</h1>
        </div>
      </div>
      {error ? <div className="form-error">{error}</div> : null}
      <form className="entity-form" onSubmit={handleSubmit}>
        <label>
          Тип данных
          <select value={target} onChange={(event) => setTarget(event.target.value)}>
            {importTargets.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          CSV-файл
          <input accept=".csv,text/csv" type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </label>
        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Импорт..." : "Импортировать"}
          </button>
        </div>
      </form>
      <div className="state-box">
        Ожидаемые колонки для «{currentTarget.label}»: <code>{currentTarget.columns}</code>
      </div>
      {result ? (
        <div className="import-result">
          <strong>Импортировано строк: {result.imported}</strong>
          {result.errors.length ? (
            <div>
              <h2>Ошибки</h2>
              <ul>
                {result.errors.map((item) => (
                  <li key={`${item.line}-${item.message}`}>
                    Строка {item.line}: {item.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Ошибок нет</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
