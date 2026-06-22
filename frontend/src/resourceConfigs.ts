import type { CrudConfig } from "./CrudPage";

export const resourceConfigs: Record<string, CrudConfig> = {
  clients: {
    title: "Клиенты",
    endpoint: "/clients",
    searchPlaceholder: "Название, контакт, email",
    fields: [
      { name: "name", label: "Название", required: true },
      { name: "contactPerson", label: "Контактное лицо" },
      { name: "phone", label: "Телефон" },
      { name: "email", label: "Email", type: "email" },
      { name: "source", label: "Источник" },
      { name: "crmLeadId", label: "CRM Lead", type: "select", source: "crmLeads" },
      { name: "status", label: "Статус" }
    ],
    columns: [
      { key: "name", label: "Название" },
      { key: "contactPerson", label: "Контакт" },
      { key: "phone", label: "Телефон" },
      { key: "email", label: "Email" },
      { key: "crmLead.title", label: "CRM Lead" },
      { key: "status", label: "Статус" }
    ]
  },
  projects: {
    title: "Проекты",
    endpoint: "/projects",
    searchPlaceholder: "Название проекта",
    fields: [
      { name: "name", label: "Название", required: true },
      { name: "clientId", label: "Клиент", type: "select", source: "clients", required: true },
      { name: "crmLeadId", label: "CRM Lead", type: "select", source: "crmLeads" },
      { name: "responsibleUserId", label: "Ответственный", type: "select", source: "users", required: true },
      { name: "directionId", label: "Направление", type: "select", source: "directions", required: true },
      { name: "statusId", label: "Статус", type: "select", source: "projectStatuses", required: true },
      { name: "startDate", label: "Дата начала", type: "date", required: true },
      { name: "plannedEndDate", label: "Плановая дата окончания", type: "date" },
      { name: "actualEndDate", label: "Фактическая дата окончания", type: "date" },
      { name: "budget", label: "Бюджет", type: "number", min: 0, step: 10000, required: true },
      { name: "description", label: "Описание", type: "textarea" }
    ],
    columns: [
      { key: "name", label: "Название" },
      { key: "client.name", label: "Клиент" },
      { key: "crmLead.title", label: "CRM Lead" },
      { key: "responsibleUser.fullName", label: "Ответственный" },
      { key: "direction.name", label: "Направление" },
      { key: "status.name", label: "Статус" },
      { key: "budget", label: "Бюджет" }
    ]
  },
  tasks: {
    title: "Задачи",
    endpoint: "/tasks",
    searchPlaceholder: "Название задачи",
    fields: [
      { name: "projectId", label: "Проект", type: "select", source: "projects", required: true },
      { name: "crmLeadId", label: "CRM Lead", type: "select", source: "crmLeads" },
      { name: "title", label: "Название", required: true },
      { name: "description", label: "Описание", type: "textarea" },
      { name: "responsibleUserId", label: "Ответственный", type: "select", source: "users", required: true },
      { name: "statusId", label: "Статус", type: "select", source: "taskStatuses", required: true },
      { name: "priority", label: "Приоритет", type: "select", required: true, options: [
        { value: "low", label: "Низкий" },
        { value: "medium", label: "Средний" },
        { value: "high", label: "Высокий" }
      ] },
      { name: "plannedEndDate", label: "Плановая дата окончания", type: "date" },
      { name: "actualEndDate", label: "Фактическая дата окончания", type: "date" },
      { name: "laborHours", label: "Трудозатраты", type: "number", min: 0, step: 0.5 }
    ],
    columns: [
      { key: "title", label: "Название" },
      { key: "project.name", label: "Проект" },
      { key: "crmLead.title", label: "CRM Lead" },
      { key: "responsibleUser.fullName", label: "Ответственный" },
      { key: "status.name", label: "Статус" },
      { key: "priority", label: "Приоритет" }
    ]
  },
  finance: {
    title: "Финансовые записи",
    endpoint: "/financial-values",
    fields: [
      { name: "projectId", label: "Проект", type: "select", source: "projects", required: true },
      { name: "periodId", label: "Период", type: "select", source: "periods", required: true },
      { name: "type", label: "Тип", type: "select", required: true, options: [
        { value: "income", label: "Доход" },
        { value: "expense", label: "Расход" },
        { value: "planned_income", label: "Плановый доход" },
        { value: "planned_expense", label: "Плановый расход" }
      ] },
      { name: "amount", label: "Сумма", type: "number", min: 0, step: 10000, required: true },
      { name: "date", label: "Дата", type: "date", required: true },
      { name: "comment", label: "Комментарий", type: "textarea" }
    ],
    columns: [
      { key: "project.name", label: "Проект" },
      { key: "period.name", label: "Период" },
      { key: "type", label: "Тип" },
      { key: "amount", label: "Сумма" },
      { key: "createdBy.fullName", label: "Автор" }
    ]
  }
};

export const referenceConfigs: CrudConfig[] = [
  {
    title: "Статусы",
    endpoint: "/references/statuses",
    fields: [
      { name: "entityType", label: "Тип сущности", type: "select", required: true, options: [
        { value: "client", label: "Клиент" },
        { value: "project", label: "Проект" },
        { value: "task", label: "Задача" }
      ] },
      { name: "code", label: "Код", required: true },
      { name: "name", label: "Название", required: true },
      { name: "color", label: "Цвет" },
      { name: "isFinal", label: "Финальный", type: "checkbox" },
      { name: "sortOrder", label: "Порядок", type: "number", min: 0, step: 1 }
    ],
    columns: [
      { key: "entityType", label: "Сущность" },
      { key: "code", label: "Код" },
      { key: "name", label: "Название" },
      { key: "color", label: "Цвет" },
      { key: "sortOrder", label: "Порядок" }
    ]
  },
  {
    title: "Направления",
    endpoint: "/references/directions",
    fields: [
      { name: "name", label: "Название", required: true },
      { name: "description", label: "Описание", type: "textarea" },
      { name: "isActive", label: "Активно", type: "checkbox" }
    ],
    columns: [
      { key: "name", label: "Название" },
      { key: "description", label: "Описание" },
      { key: "isActive", label: "Активно", render: (item) => item.isActive ? "Да" : "Нет" }
    ]
  },
  {
    title: "Отчетные периоды",
    endpoint: "/references/periods",
    fields: [
      { name: "name", label: "Название", required: true },
      { name: "dateFrom", label: "Дата начала", type: "date", required: true },
      { name: "dateTo", label: "Дата окончания", type: "date", required: true },
      { name: "isClosed", label: "Закрыт", type: "checkbox" }
    ],
    columns: [
      { key: "name", label: "Название" },
      { key: "dateFrom", label: "Начало", render: (item) => String(item.dateFrom ?? "").slice(0, 10) },
      { key: "dateTo", label: "Окончание", render: (item) => String(item.dateTo ?? "").slice(0, 10) },
      { key: "isClosed", label: "Закрыт", render: (item) => item.isClosed ? "Да" : "Нет" }
    ]
  }
];
