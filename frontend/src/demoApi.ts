import type { User } from "./types";

export const isDemoMode = import.meta.env?.VITE_DEMO_MODE === "true";

const demoUser: User = {
  id: "demo-admin",
  fullName: "Администратор демо",
  email: "admin@example.com",
  role: {
    code: "admin",
    name: "Администратор"
  }
};

const now = new Date("2026-06-10T09:30:00+07:00");

function iso(hoursOffset: number) {
  return new Date(now.getTime() + hoursOffset * 60 * 60 * 1000).toISOString();
}

const stages = [
  { stageExternalId: "NEW", stageName: "Новый", count: 3 },
  { stageExternalId: "QUALIFY", stageName: "Квалификация", count: 4 },
  { stageExternalId: "PRESENTATION", stageName: "Презентация", count: 2 },
  { stageExternalId: "NEGOTIATION", stageName: "Согласование", count: 2 },
  { stageExternalId: "WON", stageName: "Успешно", count: 1 }
];

const leads = [
  {
    id: "lead-001",
    externalId: "B24-10481",
    title: "Поставка расходных материалов для сети клиник",
    lifecycleStatus: "active",
    amount: 1280000,
    currency: "RUB",
    source: "Bitrix24",
    contactName: "Марина Соколова",
    contactPhone: "+7 913 210-44-20",
    contactEmail: "sokolova@example.ru",
    assignedByName: "Анна Орлова",
    assignedByExternalId: "U-142",
    lastSyncedAt: iso(-1),
    stage: { name: "Согласование", color: "#c8102e", semantic: "process" },
    activities: [
      { id: "act-001", subject: "Согласовать спецификацию", completed: false, deadline: iso(8), responsibleName: "Анна Орлова" },
      { id: "act-002", subject: "Подготовить коммерческое предложение", completed: true, deadline: iso(-28), responsibleName: "Илья Мельников" }
    ],
    clients: [{ id: "client-001", name: "Сибирская медицинская сеть", contactPerson: "Марина Соколова", phone: "+7 913 210-44-20", email: "sokolova@example.ru" }],
    projects: [{ id: "project-001", name: "CRM-контур поставок", status: { name: "В работе" }, responsibleUser: { fullName: "Илья Мельников" } }],
    tasks: [{ id: "task-001", title: "Проверить цены поставщиков", project: { name: "CRM-контур поставок" }, status: { name: "В работе" }, responsibleUser: { fullName: "Илья Мельников" } }],
    reportItems: [{ id: "rep-001", status: "submitted", comment: "Клиент подтвердил объем, требуется финальная скидка.", report: { workDate: iso(-24), worker: { fullName: "Анна Орлова" } }, activity: { subject: "Согласовать спецификацию" } }],
    outboundCommands: [{ id: "cmd-001", commandType: "UPDATE_LEAD_STAGE", status: "queued", createdAt: iso(-2), errorMessage: null }],
    integrationEvents: [{ id: "evt-001", eventType: "lead.updated", status: "processed", createdAt: iso(-1), errorMessage: null }]
  },
  {
    id: "lead-002",
    externalId: "B24-10482",
    title: "Автоматизация отчетности отдела продаж",
    lifecycleStatus: "active",
    amount: 860000,
    currency: "RUB",
    source: "Сайт",
    contactName: "Олег Власов",
    contactPhone: "+7 923 551-19-80",
    contactEmail: "vlasov@example.ru",
    assignedByName: "Павел Кузнецов",
    assignedByExternalId: "U-188",
    lastSyncedAt: iso(-3),
    stage: { name: "Квалификация", color: "#f59e0b", semantic: "process" },
    activities: [
      { id: "act-003", subject: "Провести демонстрацию dashboard", completed: false, deadline: iso(26), responsibleName: "Павел Кузнецов" },
      { id: "act-004", subject: "Уточнить контур интеграций", completed: false, deadline: iso(-6), responsibleName: "Павел Кузнецов" }
    ],
    clients: [{ id: "client-002", name: "Технопром-Сервис", contactPerson: "Олег Власов", phone: "+7 923 551-19-80", email: "vlasov@example.ru" }],
    projects: [{ id: "project-002", name: "Аналитика продаж", status: { name: "Планирование" }, responsibleUser: { fullName: "Павел Кузнецов" } }],
    tasks: [{ id: "task-002", title: "Собрать список показателей", project: { name: "Аналитика продаж" }, status: { name: "Открыта" }, responsibleUser: { fullName: "Павел Кузнецов" } }],
    reportItems: [{ id: "rep-002", status: "missed", comment: "Отчет не получен до 19:00.", report: { workDate: iso(-24), worker: { fullName: "Павел Кузнецов" } }, activity: null }],
    outboundCommands: [{ id: "cmd-002", commandType: "CREATE_ACTIVITY", status: "failed", createdAt: iso(-5), errorMessage: "Bitrix24 вернул ограничение по частоте запросов" }],
    integrationEvents: [{ id: "evt-002", eventType: "activity.created", status: "failed", createdAt: iso(-5), errorMessage: "Rate limit exceeded" }]
  },
  {
    id: "lead-003",
    externalId: "B24-10483",
    title: "Внедрение Telegram-отчетов для внешних сотрудников",
    lifecycleStatus: "active",
    amount: 540000,
    currency: "RUB",
    source: "Рекомендация",
    contactName: "Екатерина Минаева",
    contactPhone: "+7 913 772-31-14",
    contactEmail: "minaeva@example.ru",
    assignedByName: "Дмитрий Романов",
    assignedByExternalId: "U-201",
    lastSyncedAt: iso(-2),
    stage: { name: "Презентация", color: "#2563eb", semantic: "process" },
    activities: [{ id: "act-005", subject: "Отправить сценарий пилота", completed: false, deadline: iso(14), responsibleName: "Дмитрий Романов" }],
    clients: [{ id: "client-003", name: "Логистика Восток", contactPerson: "Екатерина Минаева", phone: "+7 913 772-31-14", email: "minaeva@example.ru" }],
    projects: [{ id: "project-003", name: "Telegram daily workflow", status: { name: "Оценка" }, responsibleUser: { fullName: "Дмитрий Романов" } }],
    tasks: [{ id: "task-003", title: "Описать роли внешних сотрудников", project: { name: "Telegram daily workflow" }, status: { name: "В работе" }, responsibleUser: { fullName: "Дмитрий Романов" } }],
    reportItems: [{ id: "rep-003", status: "submitted", comment: "Пилот согласован на 2 недели.", report: { workDate: iso(-24), worker: { fullName: "Дмитрий Романов" } }, activity: { subject: "Отправить сценарий пилота" } }],
    outboundCommands: [{ id: "cmd-003", commandType: "ADD_COMMENT", status: "succeeded", createdAt: iso(-8), errorMessage: null }],
    integrationEvents: [{ id: "evt-003", eventType: "telegram.report.received", status: "processed", createdAt: iso(-9), errorMessage: null }]
  }
];

const leadList = [
  ...leads,
  { id: "lead-004", externalId: "B24-10484", title: "Сопровождение корпоративного портала", stage: { name: "Новый" }, assignedByName: "Анна Орлова", activities: [{ id: "act-006" }] },
  { id: "lead-005", externalId: "B24-10485", title: "Интеграция Bitrix24 с управленческой отчетностью", stage: { name: "Квалификация" }, assignedByName: "Павел Кузнецов", activities: [{ id: "act-007" }, { id: "act-008" }] },
  { id: "lead-006", externalId: "B24-10486", title: "Аудит данных по клиентским проектам", stage: { name: "Успешно" }, assignedByName: "Дмитрий Романов", activities: [] },
  { id: "lead-007", externalId: "B24-10487", title: "BI-панель финансовых отклонений", stage: { name: "Согласование" }, assignedByName: "Анна Орлова", activities: [{ id: "act-009" }] },
  { id: "lead-008", externalId: "B24-10488", title: "Импорт исторических CRM-данных", stage: { name: "Новый" }, assignedByName: "Павел Кузнецов", activities: [] }
];

const workers = [
  {
    id: "worker-001",
    fullName: "Анна Орлова",
    bitrixUserExternalId: "U-142",
    status: "active",
    messengerAccounts: [{ id: "msg-001", provider: "telegram", isVerified: true, username: "@orlova_sales", externalChatId: "701001", lastInboundAt: iso(-10) }],
    dailyPlans: [{ id: "plan-001", workDate: iso(0), status: "sent", generatedAt: iso(-12), sentAt: iso(-11), summary: "3 звонка по лидам, согласование КП, контроль просроченных дел." }],
    dailyReports: [{ id: "report-001", workDate: iso(-24), status: "submitted", submittedAt: iso(-15), summary: "Закрыта подготовка КП, клиент запросил финальную скидку." }]
  },
  {
    id: "worker-002",
    fullName: "Павел Кузнецов",
    bitrixUserExternalId: "U-188",
    status: "active",
    messengerAccounts: [{ id: "msg-002", provider: "telegram", isVerified: true, username: "@kuznetsov_pm", externalChatId: "701002", lastInboundAt: iso(-34) }],
    dailyPlans: [{ id: "plan-002", workDate: iso(0), status: "queued", generatedAt: iso(-12), sentAt: null, summary: "Демонстрация dashboard и уточнение интеграций Bitrix24." }],
    dailyReports: [{ id: "report-002", workDate: iso(-24), status: "missed", submittedAt: null, summary: "Отчет не поступил." }]
  },
  {
    id: "worker-003",
    fullName: "Дмитрий Романов",
    bitrixUserExternalId: "U-201",
    status: "active",
    messengerAccounts: [{ id: "msg-003", provider: "telegram", isVerified: true, username: "@romanov_ops", externalChatId: "701003", lastInboundAt: iso(-5) }],
    dailyPlans: [{ id: "plan-003", workDate: iso(0), status: "sent", generatedAt: iso(-12), sentAt: iso(-11), summary: "Подготовить сценарий пилота и связать лид с проектом." }],
    dailyReports: [{ id: "report-003", workDate: iso(-24), status: "submitted", submittedAt: iso(-16), summary: "Пилот Telegram-отчетов согласован с клиентом." }]
  }
];

const tasks = [
  { id: "ut-001", source: "bitrix", title: "Согласовать спецификацию", status: "in_progress", dueAt: iso(8), responsible: "Анна Орлова", project: "CRM-контур поставок", lead: { id: "lead-001", title: "Поставка расходных материалов для сети клиник", externalId: "B24-10481" } },
  { id: "ut-002", source: "bitrix", title: "Уточнить контур интеграций", status: "failed", dueAt: iso(-6), responsible: "Павел Кузнецов", project: "Аналитика продаж", lead: { id: "lead-002", title: "Автоматизация отчетности отдела продаж", externalId: "B24-10482" } },
  { id: "ut-003", source: "internal", title: "Описать роли внешних сотрудников", status: "in_progress", dueAt: iso(18), responsible: "Дмитрий Романов", project: "Telegram daily workflow", lead: { id: "lead-003", title: "Внедрение Telegram-отчетов для внешних сотрудников", externalId: "B24-10483" } },
  { id: "ut-004", source: "internal", title: "Проверить качество импортированных данных", status: "pending", dueAt: iso(32), responsible: "Анна Орлова", project: "Импорт CRM", lead: { id: "lead-008", title: "Импорт исторических CRM-данных", externalId: "B24-10488" } }
];

const integrationStatus = {
  counters: {
    failedEvents: 2,
    queuedTelegram: 1,
    failedTelegram: 1,
    queuedBitrix: 2,
    failedBitrix: 1
  },
  syncJobs: [
    { id: "sync-001", provider: "bitrix24", jobType: "lead_sync", status: "succeeded", createdAt: iso(-2), finishedAt: iso(-1), errorMessage: null },
    { id: "sync-002", provider: "telegram", jobType: "daily_report_poll", status: "failed", createdAt: iso(-5), finishedAt: iso(-5), errorMessage: "Не получен отчет от сотрудника U-188" }
  ],
  recentEvents: [
    { id: "evt-001", provider: "bitrix24", direction: "inbound", eventType: "lead.updated", externalId: "B24-10481", status: "processed", createdAt: iso(-1), processedAt: iso(-1), errorMessage: null },
    { id: "evt-002", provider: "bitrix24", direction: "outbound", eventType: "activity.created", externalId: "B24-10482", status: "failed", createdAt: iso(-5), processedAt: iso(-5), errorMessage: "Rate limit exceeded" },
    { id: "evt-003", provider: "telegram", direction: "inbound", eventType: "daily_report.received", externalId: "701003", status: "processed", createdAt: iso(-9), processedAt: iso(-9), errorMessage: null },
    { id: "evt-004", provider: "telegram", direction: "outbound", eventType: "daily_plan.send", externalId: "701002", status: "failed", createdAt: iso(-11), processedAt: iso(-11), errorMessage: "Telegram chat is unavailable" }
  ],
  telegramQueue: [
    { id: "tq-001", status: "queued", recipientChatId: "701002", text: "План на день: демонстрация dashboard, уточнение интеграций Bitrix24.", attempts: 1, nextAttemptAt: iso(1), sentAt: null, errorMessage: null, createdAt: iso(-11), messengerAccount: { username: "@kuznetsov_pm", externalChatId: "701002", worker: { id: "worker-002", fullName: "Павел Кузнецов", bitrixUserExternalId: "U-188" } } },
    { id: "tq-002", status: "failed", recipientChatId: "701004", text: "Напоминание о ежедневном отчете.", attempts: 3, nextAttemptAt: null, sentAt: null, errorMessage: "Telegram chat is unavailable", createdAt: iso(-20), messengerAccount: null }
  ],
  bitrixQueue: [
    { id: "bq-001", commandType: "UPDATE_LEAD_STAGE", status: "queued", attempts: 1, nextAttemptAt: iso(1), sentAt: null, errorMessage: null, createdAt: iso(-2), lead: { id: "lead-001", title: "Поставка расходных материалов для сети клиник", externalId: "B24-10481" }, activity: null },
    { id: "bq-002", commandType: "CREATE_ACTIVITY", status: "failed", attempts: 3, nextAttemptAt: null, sentAt: null, errorMessage: "Bitrix24 вернул ограничение по частоте запросов", createdAt: iso(-5), lead: { id: "lead-002", title: "Автоматизация отчетности отдела продаж", externalId: "B24-10482" }, activity: { id: "act-004", subject: "Уточнить контур интеграций", deadline: iso(-6) } }
  ],
  recentErrors: [
    { id: "evt-002", provider: "bitrix24", direction: "outbound", eventType: "activity.created", externalId: "B24-10482", status: "failed", createdAt: iso(-5), processedAt: iso(-5), errorMessage: "Rate limit exceeded" },
    { id: "evt-004", provider: "telegram", direction: "outbound", eventType: "daily_plan.send", externalId: "701002", status: "failed", createdAt: iso(-11), processedAt: iso(-11), errorMessage: "Telegram chat is unavailable" }
  ]
};

const summary = {
  totals: {
    totalLeads: 12,
    activeLeads: 9,
    overdueActivities: 2,
    leadsWithoutActivities: 2,
    reportsSubmittedToday: 3,
    reportsMissed: 1,
    failedEvents: 2,
    linkedClients: 8,
    linkedProjects: 6,
    linkedTasks: 24,
    pipelineAmount: 6070000
  },
  byStage: stages,
  recentSyncJobs: integrationStatus.syncJobs
};

const users = [
  { id: "demo-admin", fullName: "Администратор демо", email: "admin@example.com", role: demoUser.role },
  { id: "user-001", fullName: "Анна Орлова", email: "orlova@example.ru" },
  { id: "user-002", fullName: "Павел Кузнецов", email: "kuznetsov@example.ru" },
  { id: "user-003", fullName: "Дмитрий Романов", email: "romanov@example.ru" }
];

const periods = [
  { id: "period-2026-05", name: "Май 2026", dateFrom: "2026-05-01", dateTo: "2026-05-31", isClosed: true },
  { id: "period-2026-06", name: "Июнь 2026", dateFrom: "2026-06-01", dateTo: "2026-06-30", isClosed: false },
  { id: "period-2026-q2", name: "2 квартал 2026", dateFrom: "2026-04-01", dateTo: "2026-06-30", isClosed: false }
];

const directions = [
  { id: "dir-analytics", name: "Аналитика и отчетность", description: "Dashboard, отчеты и управленческие показатели", isActive: true },
  { id: "dir-crm", name: "CRM-интеграции", description: "Bitrix24, лиды и обмен данными", isActive: true },
  { id: "dir-ops", name: "Операционные процессы", description: "Планы, задачи и контроль исполнения", isActive: true }
];

const statuses = [
  { id: "status-client-active", entityType: "client", code: "active", name: "Активен", color: "#16a34a", sortOrder: 10 },
  { id: "status-project-active", entityType: "project", code: "active", name: "В работе", color: "#c8102e", sortOrder: 20 },
  { id: "status-project-planned", entityType: "project", code: "planned", name: "Планирование", color: "#f59e0b", sortOrder: 10 },
  { id: "status-project-completed", entityType: "project", code: "completed", name: "Завершен", color: "#16a34a", sortOrder: 30 },
  { id: "status-task-open", entityType: "task", code: "open", name: "Открыта", color: "#f59e0b", sortOrder: 10 },
  { id: "status-task-progress", entityType: "task", code: "progress", name: "В работе", color: "#c8102e", sortOrder: 20 },
  { id: "status-task-done", entityType: "task", code: "done", name: "Готово", color: "#16a34a", sortOrder: 30 }
];

const clients = [
  { id: "client-001", name: "Сибирская медицинская сеть", contactPerson: "Марина Соколова", phone: "+7 913 210-44-20", email: "sokolova@example.ru", source: "Bitrix24", status: "Активен", crmLead: { title: "Поставка расходных материалов для сети клиник" } },
  { id: "client-002", name: "Технопром-Сервис", contactPerson: "Олег Власов", phone: "+7 923 551-19-80", email: "vlasov@example.ru", source: "Сайт", status: "Активен", crmLead: { title: "Автоматизация отчетности отдела продаж" } },
  { id: "client-003", name: "Логистика Восток", contactPerson: "Екатерина Минаева", phone: "+7 913 772-31-14", email: "minaeva@example.ru", source: "Рекомендация", status: "В работе", crmLead: { title: "Внедрение Telegram-отчетов для внешних сотрудников" } }
];

const projects = [
  { id: "project-001", name: "CRM-контур поставок", client: clients[0], crmLead: { title: "Поставка расходных материалов для сети клиник" }, responsibleUser: users[1], direction: directions[1], status: { name: "В работе" }, startDate: "2026-05-12", plannedEndDate: "2026-06-24", budget: 1280000 },
  { id: "project-002", name: "Аналитика продаж", client: clients[1], crmLead: { title: "Автоматизация отчетности отдела продаж" }, responsibleUser: users[2], direction: directions[0], status: { name: "Планирование" }, startDate: "2026-06-02", plannedEndDate: "2026-07-10", budget: 860000 },
  { id: "project-003", name: "Telegram daily workflow", client: clients[2], crmLead: { title: "Внедрение Telegram-отчетов для внешних сотрудников" }, responsibleUser: users[3], direction: directions[2], status: { name: "В работе" }, startDate: "2026-05-28", plannedEndDate: "2026-06-30", budget: 540000 }
];

const internalTasks = [
  { id: "task-001", title: "Проверить цены поставщиков", project: projects[0], crmLead: { title: "Поставка расходных материалов для сети клиник" }, responsibleUser: users[2], status: { name: "В работе" }, priority: "high", plannedEndDate: iso(-8), laborHours: 6 },
  { id: "task-002", title: "Собрать список показателей", project: projects[1], crmLead: { title: "Автоматизация отчетности отдела продаж" }, responsibleUser: users[2], status: { name: "Открыта" }, priority: "medium", plannedEndDate: iso(24), laborHours: 4 },
  { id: "task-003", title: "Описать роли внешних сотрудников", project: projects[2], crmLead: { title: "Внедрение Telegram-отчетов для внешних сотрудников" }, responsibleUser: users[3], status: { name: "Готово" }, priority: "medium", plannedEndDate: iso(12), laborHours: 5 }
];

const financialValues = [
  { id: "fin-001", project: projects[0], period: periods[1], type: "planned_income", amount: 1280000, date: "2026-06-05", createdBy: users[0], comment: "План по сделке" },
  { id: "fin-002", project: projects[0], period: periods[1], type: "income", amount: 420000, date: "2026-06-09", createdBy: users[0], comment: "Первый платеж" },
  { id: "fin-003", project: projects[1], period: periods[1], type: "planned_income", amount: 860000, date: "2026-06-07", createdBy: users[0], comment: "Плановая выручка" },
  { id: "fin-004", project: projects[2], period: periods[1], type: "expense", amount: 120000, date: "2026-06-08", createdBy: users[0], comment: "Настройка пилота" }
];

const reports = [
  { id: "report-001", title: "Финансовая сводка по лидам", description: "План/факт по проектам, связанным с CRM-лидами", type: "finance", filters: {}, createdAt: iso(-18), createdBy: users[0] },
  { id: "report-002", title: "Контроль задач внешних сотрудников", description: "Просрочки, ответственные и связанные лиды", type: "tasks", filters: {}, createdAt: iso(-36), createdBy: users[0] }
];

const reportDetails = {
  "report-001": {
    ...reports[0],
    result: {
      columns: ["Проект", "Плановый доход", "Фактический доход", "Расходы", "Маржа"],
      rows: [
        { Проект: "CRM-контур поставок", "Плановый доход": 1280000, "Фактический доход": 420000, Расходы: 160000, Маржа: 260000 },
        { Проект: "Аналитика продаж", "Плановый доход": 860000, "Фактический доход": 0, Расходы: 0, Маржа: 0 },
        { Проект: "Telegram daily workflow", "Плановый доход": 540000, "Фактический доход": 0, Расходы: 120000, Маржа: -120000 }
      ]
    }
  },
  "report-002": {
    ...reports[1],
    result: {
      columns: ["Задача", "Проект", "Ответственный", "Статус", "Срок"],
      rows: internalTasks.map((task) => ({
        Задача: task.title,
        Проект: task.project.name,
        Ответственный: task.responsibleUser.fullName,
        Статус: task.status.name,
        Срок: String(task.plannedEndDate).slice(0, 10)
      }))
    }
  }
};

const dashboard = {
  kpi: {
    activeProjectsCount: 3,
    completedProjectsCount: 1,
    overdueTasksCount: 2,
    completedTasksPercent: 68,
    plannedIncome: 2680000,
    actualIncome: 420000,
    expenses: 280000,
    profit: 140000
  },
  charts: {
    projectsByStatus: [
      { name: "В работе", value: 2 },
      { name: "Планирование", value: 1 },
      { name: "Завершен", value: 1 }
    ],
    tasksByStatus: [
      { name: "Открыта", value: 4 },
      { name: "В работе", value: 7 },
      { name: "Готово", value: 6 }
    ],
    financeDynamicsByPeriod: [
      { period: "Апрель", income: 380000, expenses: 210000 },
      { period: "Май", income: 640000, expenses: 260000 },
      { period: "Июнь", income: 420000, expenses: 280000 }
    ],
    incomeExpenseComparison: [
      { name: "Доходы", value: 420000 },
      { name: "Расходы", value: 280000 }
    ],
    topClientsByRevenue: [
      { clientId: "client-001", name: "Сибирская медицинская сеть", revenue: 420000 },
      { clientId: "client-002", name: "Технопром-Сервис", revenue: 0 },
      { clientId: "client-003", name: "Логистика Восток", revenue: 0 }
    ]
  },
  problemData: {
    overdueTasks: [
      { id: "task-001", title: "Проверить цены поставщиков", project: "CRM-контур поставок", responsibleUser: "Илья Мельников", plannedEndDate: iso(-8), status: "В работе" },
      { id: "task-004", title: "Уточнить контур интеграций", project: "Аналитика продаж", responsibleUser: "Павел Кузнецов", plannedEndDate: iso(-6), status: "Открыта" }
    ],
    projectsNearDeadline: [
      { id: "project-001", name: "CRM-контур поставок", client: "Сибирская медицинская сеть", plannedEndDate: iso(48), status: "В работе" },
      { id: "project-003", name: "Telegram daily workflow", client: "Логистика Восток", plannedEndDate: iso(72), status: "В работе" }
    ],
    projectsWithNegativeProfit: [
      { id: "project-003", name: "Telegram daily workflow", client: "Логистика Восток", income: 0, expenses: 120000, profit: -120000 }
    ]
  }
};

const auditLogs = [
  { id: "audit-001", action: "login", entityType: "User", entityId: "demo-admin", oldValue: null, newValue: { email: "admin@example.com" }, createdAt: iso(-1), user: users[0] },
  { id: "audit-002", action: "update", entityType: "Lead", entityId: "lead-001", oldValue: { stage: "Презентация" }, newValue: { stage: "Согласование" }, createdAt: iso(-3), user: users[1] },
  { id: "audit-003", action: "export", entityType: "Report", entityId: "report-001", oldValue: null, newValue: { format: "csv" }, createdAt: iso(-18), user: users[0] }
];

const dataByPath: Record<string, unknown[]> = {
  "/clients": clients,
  "/projects": projects,
  "/tasks": internalTasks,
  "/financial-values": financialValues,
  "/users": users,
  "/references/periods": periods,
  "/references/directions": directions,
  "/references/statuses": statuses,
  "/leadops/lead-options": leadList.map((lead) => ({ id: lead.id, name: lead.title, title: lead.title, externalId: lead.externalId })),
  "/reports": reports,
  "/audit-logs": auditLogs
};

export async function demoLogin(email: string, password: string) {
  if (email !== "admin@example.com" || password !== "admin12345") {
    throw new Error("Для демо используйте admin@example.com / admin12345");
  }

  return { accessToken: "demo-token", user: demoUser };
}

export function demoMe() {
  return { user: demoUser };
}

export async function demoApiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  await new Promise((resolve) => window.setTimeout(resolve, 120));

  const method = (options.method ?? "GET").toUpperCase();
  if (method !== "GET") {
    return { ok: true } as T;
  }

  const normalizedPath = path.split("?")[0];

  if (normalizedPath === "/analytics/dashboard") {
    return dashboard as T;
  }

  if (path.startsWith("/leadops/analytics/summary")) {
    return summary as T;
  }

  if (path.startsWith("/leadops/leads?")) {
    return { items: leadList } as T;
  }

  const leadMatch = path.match(/^\/leadops\/leads\/([^/?]+)/);
  if (leadMatch) {
    const lead = leads.find((item) => item.id === leadMatch[1]) ?? leads[0];
    return { data: lead } as T;
  }

  if (path.startsWith("/leadops/tasks/unified")) {
    return { items: tasks } as T;
  }

  if (path.startsWith("/leadops/workers")) {
    return { items: workers } as T;
  }

  if (path.startsWith("/leadops/integrations/status")) {
    return integrationStatus as T;
  }

  const reportMatch = normalizedPath.match(/^\/reports\/([^/]+)$/);
  if (reportMatch) {
    return { data: reportDetails[reportMatch[1] as keyof typeof reportDetails] ?? reportDetails["report-001"] } as T;
  }

  if (normalizedPath in dataByPath) {
    return { data: dataByPath[normalizedPath] } as T;
  }

  throw new Error("В статическом демо этот раздел не подключен к API");
}
