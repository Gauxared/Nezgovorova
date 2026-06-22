import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_PREFIX = "TEST-LEAD-";
const workerExternalIds = ["TEST-WORKER-101", "TEST-WORKER-102", "TEST-WORKER-103", "TEST-WORKER-104"];
const workerChatIds = ["test-chat-101", "test-chat-102", "test-chat-103", "test-chat-104"];

const stages = [
  { externalId: "TEST_NEW", name: "Новый лид", sortOrder: 10, color: "#2563eb", semantic: "process" },
  { externalId: "TEST_CONTACT", name: "Первичный контакт", sortOrder: 20, color: "#0ea5e9", semantic: "process" },
  { externalId: "TEST_QUALIFICATION", name: "Квалификация", sortOrder: 30, color: "#f59e0b", semantic: "process" },
  { externalId: "TEST_PROPOSAL", name: "Коммерческое предложение", sortOrder: 40, color: "#7c3aed", semantic: "process" },
  { externalId: "TEST_NEGOTIATION", name: "Переговоры", sortOrder: 50, color: "#0f766e", semantic: "process" },
  { externalId: "TEST_CONTRACT", name: "Согласование договора", sortOrder: 60, color: "#db2777", semantic: "process" },
  { externalId: "TEST_WON", name: "Успешно реализован", sortOrder: 70, color: "#16a34a", semantic: "success" },
  { externalId: "TEST_LOST", name: "Не реализован", sortOrder: 80, color: "#dc2626", semantic: "failure" }
] as const;

const leadSpecs = [
  {
    externalId: "TEST-LEAD-001",
    title: "Внедрение аналитического кабинета для отдела продаж",
    stageExternalId: "TEST_QUALIFICATION",
    amount: "780000.00",
    source: "Сайт",
    assignedByExternalId: "TEST-WORKER-101",
    assignedByName: "Анна Сидорова",
    contactName: "Игорь Лебедев",
    contactPhone: "+7 913 000-10-01",
    contactEmail: "lebedev@example.test",
    company: "ООО «Север Продажи»",
    comments: "Нужна демонстрация dashboard и отчета по воронке.",
    customerPath: "Сайт -> заявка -> консультация"
  },
  {
    externalId: "TEST-LEAD-002",
    title: "Интеграция Bitrix24 с Telegram-отчетами",
    stageExternalId: "TEST_PROPOSAL",
    amount: "520000.00",
    source: "Рекомендация",
    assignedByExternalId: "TEST-WORKER-102",
    assignedByName: "Мария Кузнецова",
    contactName: "Елена Орлова",
    contactPhone: "+7 913 000-10-02",
    contactEmail: "orlova@example.test",
    company: "АО «Сервис Линия»",
    comments: "Клиент просит план внедрения и оценку сроков.",
    customerPath: "Партнер -> звонок -> КП"
  },
  {
    externalId: "TEST-LEAD-003",
    title: "Автоматизация ежедневных планов сотрудников",
    stageExternalId: "TEST_NEGOTIATION",
    amount: "960000.00",
    source: "Вебинар",
    assignedByExternalId: "TEST-WORKER-103",
    assignedByName: "Петр Иванов",
    contactName: "Дмитрий Соколов",
    contactPhone: "+7 913 000-10-03",
    contactEmail: "sokolov@example.test",
    company: "ООО «Рабочий Контур»",
    comments: "Высокий приоритет, нужен прототип до конца недели.",
    customerPath: "Вебинар -> демо -> переговоры"
  },
  {
    externalId: "TEST-LEAD-004",
    title: "Миграция CRM-данных из Excel",
    stageExternalId: "TEST_NEW",
    amount: "310000.00",
    source: "Холодный звонок",
    assignedByExternalId: "TEST-WORKER-104",
    assignedByName: "Дмитрий Павлов",
    contactName: "Оксана Федорова",
    contactPhone: "+7 913 000-10-04",
    contactEmail: "fedorova@example.test",
    company: "ООО «Импорт Данных»",
    comments: "Первичный контакт, нужно уточнить объем данных.",
    customerPath: "Звонок -> первичная квалификация"
  },
  {
    externalId: "TEST-LEAD-005",
    title: "Сводная управленческая отчетность",
    stageExternalId: "TEST_WON",
    amount: "1250000.00",
    source: "Повторная продажа",
    assignedByExternalId: "TEST-WORKER-101",
    assignedByName: "Анна Сидорова",
    contactName: "Сергей Ковалев",
    contactPhone: "+7 913 000-10-05",
    contactEmail: "kovalev@example.test",
    company: "ЗАО «Регион Аналитика»",
    comments: "Успешный лид для проверки завершенной воронки.",
    customerPath: "Действующий клиент -> допродажа"
  },
  {
    externalId: "TEST-LEAD-006",
    title: "Аудит качества CRM-процессов",
    stageExternalId: "TEST_LOST",
    amount: "240000.00",
    source: "Email",
    assignedByExternalId: "TEST-WORKER-102",
    assignedByName: "Мария Кузнецова",
    contactName: "Наталья Морозова",
    contactPhone: "+7 913 000-10-06",
    contactEmail: "morozova@example.test",
    company: "ООО «Контроль CRM»",
    comments: "Отказ из-за переноса бюджета.",
    customerPath: "Email -> консультация -> отказ",
    lossReason: "Бюджет перенесен на следующий квартал"
  },
  {
    externalId: "TEST-LEAD-007",
    title: "Единый реестр задач для проектного офиса",
    stageExternalId: "TEST_CONTACT",
    amount: "430000.00",
    source: "Соцсети",
    assignedByExternalId: "TEST-WORKER-103",
    assignedByName: "Петр Иванов",
    contactName: "Алина Смирнова",
    contactPhone: "+7 913 000-10-07",
    contactEmail: "smirnova@example.test",
    company: "ООО «Проектный офис»",
    comments: "Запрошена презентация по внутренним задачам.",
    customerPath: "Соцсети -> лендинг -> контакт"
  },
  {
    externalId: "TEST-LEAD-008",
    title: "Контроль финансовых показателей проектов",
    stageExternalId: "TEST_CONTRACT",
    amount: "1120000.00",
    source: "Партнер",
    assignedByExternalId: "TEST-WORKER-104",
    assignedByName: "Дмитрий Павлов",
    contactName: "Виктор Беляев",
    contactPhone: "+7 913 000-10-08",
    contactEmail: "belyaev@example.test",
    company: "АО «Финансовый контроль»",
    comments: "Договор на согласовании у клиента.",
    customerPath: "Партнер -> демо -> договор"
  },
  {
    externalId: "TEST-LEAD-009",
    title: "Настройка отчетов для отдела внедрения",
    stageExternalId: "TEST_PROPOSAL",
    amount: "670000.00",
    source: "Выставка",
    assignedByExternalId: "TEST-WORKER-101",
    assignedByName: "Анна Сидорова",
    contactName: "Роман Никитин",
    contactPhone: "+7 913 000-10-09",
    contactEmail: "nikitin@example.test",
    company: "ООО «Внедрение Плюс»",
    comments: "Нужно показать CSV-экспорт и динамику KPI.",
    customerPath: "Выставка -> встреча -> КП"
  },
  {
    externalId: "TEST-LEAD-010",
    title: "Интеграция заявок сайта с CRM",
    stageExternalId: "TEST_NEGOTIATION",
    amount: "890000.00",
    source: "Сайт",
    assignedByExternalId: "TEST-WORKER-102",
    assignedByName: "Мария Кузнецова",
    contactName: "Марина Громова",
    contactPhone: "+7 913 000-10-10",
    contactEmail: "gromova@example.test",
    company: "ООО «Заявки Онлайн»",
    comments: "Клиент сравнивает два варианта интеграции.",
    customerPath: "Сайт -> бриф -> переговоры"
  },
  {
    externalId: "TEST-LEAD-011",
    title: "Telegram-бот для ежедневных отчетов",
    stageExternalId: "TEST_CONTACT",
    amount: "390000.00",
    source: "Telegram",
    assignedByExternalId: "TEST-WORKER-103",
    assignedByName: "Петр Иванов",
    contactName: "Кирилл Егоров",
    contactPhone: "+7 913 000-10-11",
    contactEmail: "egorov@example.test",
    company: "ООО «Команда Полевых Работ»",
    comments: "Запрошен сценарий подтверждения через чат.",
    customerPath: "Telegram -> диалог -> консультация"
  },
  {
    externalId: "TEST-LEAD-012",
    title: "Комплексная цифровизация отдела сопровождения",
    stageExternalId: "TEST_WON",
    amount: "1680000.00",
    source: "Тендер",
    assignedByExternalId: "TEST-WORKER-104",
    assignedByName: "Дмитрий Павлов",
    contactName: "Лариса Волкова",
    contactPhone: "+7 913 000-10-12",
    contactEmail: "volkova@example.test",
    company: "АО «Сопровождение 24»",
    comments: "Победа в тендере, проект переведен в работу.",
    customerPath: "Тендер -> защита -> договор"
  }
] as const;

function daysFromNow(days: number, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function dayStart(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function cleanupTestData() {
  const testLeads = await prisma.crmLead.findMany({
    where: { externalId: { startsWith: TEST_PREFIX } },
    select: { id: true, externalId: true }
  });
  const leadIds = testLeads.map((lead) => lead.id);
  const leadExternalIds = testLeads.map((lead) => lead.externalId);

  const workers = await prisma.externalWorker.findMany({
    where: { bitrixUserExternalId: { in: workerExternalIds } },
    select: { id: true }
  });
  const workerIds = workers.map((worker) => worker.id);
  const accounts = await prisma.messengerAccount.findMany({
    where: { externalChatId: { in: workerChatIds } },
    select: { id: true }
  });
  const accountIds = accounts.map((account) => account.id);

  if (leadIds.length || leadExternalIds.length) {
    await prisma.workerReportItem.deleteMany({
      where: {
        OR: [
          { leadId: { in: leadIds } },
          { activity: { leadExternalId: { in: leadExternalIds } } },
          { planItem: { leadId: { in: leadIds } } }
        ]
      }
    });
    await prisma.workerDailyPlanItem.deleteMany({
      where: {
        OR: [
          { leadId: { in: leadIds } },
          { activity: { leadExternalId: { in: leadExternalIds } } }
        ]
      }
    });
    await prisma.outboundCommand.deleteMany({
      where: {
        OR: [
          { leadId: { in: leadIds } },
          { activity: { leadExternalId: { in: leadExternalIds } } },
          { idempotencyKey: { startsWith: "test-seed:" } }
        ]
      }
    });
    await prisma.crmActivity.deleteMany({ where: { leadExternalId: { in: leadExternalIds } } });
    await prisma.financialValue.deleteMany({ where: { project: { crmLeadId: { in: leadIds } } } });
    await prisma.task.deleteMany({ where: { crmLeadId: { in: leadIds } } });
    await prisma.project.deleteMany({ where: { crmLeadId: { in: leadIds } } });
    await prisma.client.deleteMany({ where: { crmLeadId: { in: leadIds } } });
    await prisma.crmLead.deleteMany({ where: { id: { in: leadIds } } });
  }

  if (workerIds.length) {
    await prisma.workerReportItem.deleteMany({ where: { report: { workerId: { in: workerIds } } } });
    await prisma.workerDailyPlanItem.deleteMany({ where: { plan: { workerId: { in: workerIds } } } });
    await prisma.workerDailyReport.deleteMany({ where: { workerId: { in: workerIds } } });
    await prisma.workerDailyPlan.deleteMany({ where: { workerId: { in: workerIds } } });
  }
  if (accountIds.length) {
    await prisma.messageDelivery.deleteMany({ where: { messengerAccountId: { in: accountIds } } });
    await prisma.messengerAccount.deleteMany({ where: { id: { in: accountIds } } });
  }
  if (workerIds.length) {
    await prisma.externalWorker.deleteMany({ where: { id: { in: workerIds } } });
  }

  await prisma.botConversationState.deleteMany({ where: { externalChatId: { in: workerChatIds } } });
  await prisma.integrationEvent.deleteMany({
    where: {
      OR: [
        { idempotencyKey: { startsWith: "test-seed:" } },
        { externalId: { startsWith: TEST_PREFIX } }
      ]
    }
  });
  await prisma.syncJob.deleteMany({ where: { jobType: { startsWith: "test-" } } });
  await prisma.messageDelivery.deleteMany({ where: { payload: { path: ["source"], equals: "test-seed" } } });
}

async function ensureBaseEntities() {
  const direction = await prisma.direction.upsert({
    where: { name: "LeadOps / CRM" },
    create: { name: "LeadOps / CRM", description: "Демо-направление для связанных проектов по лидам" },
    update: { description: "Демо-направление для связанных проектов по лидам", isActive: true }
  });

  const [projectActive, projectPlanning, projectCompleted, taskTodo, taskProgress, taskDone] = await Promise.all([
    prisma.status.upsert({
      where: { entityType_code: { entityType: "project", code: "active" } },
      create: { entityType: "project", code: "active", name: "В работе", color: "#2563eb", sortOrder: 2 },
      update: {}
    }),
    prisma.status.upsert({
      where: { entityType_code: { entityType: "project", code: "planning" } },
      create: { entityType: "project", code: "planning", name: "Планируется", color: "#64748b", sortOrder: 1 },
      update: {}
    }),
    prisma.status.upsert({
      where: { entityType_code: { entityType: "project", code: "completed" } },
      create: { entityType: "project", code: "completed", name: "Завершен", color: "#16a34a", isFinal: true, sortOrder: 3 },
      update: {}
    }),
    prisma.status.upsert({
      where: { entityType_code: { entityType: "task", code: "todo" } },
      create: { entityType: "task", code: "todo", name: "К выполнению", color: "#64748b", sortOrder: 1 },
      update: {}
    }),
    prisma.status.upsert({
      where: { entityType_code: { entityType: "task", code: "in_progress" } },
      create: { entityType: "task", code: "in_progress", name: "В работе", color: "#2563eb", sortOrder: 2 },
      update: {}
    }),
    prisma.status.upsert({
      where: { entityType_code: { entityType: "task", code: "done" } },
      create: { entityType: "task", code: "done", name: "Выполнена", color: "#16a34a", isFinal: true, sortOrder: 3 },
      update: {}
    })
  ]);

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, take: 5 });
  if (!users.length) {
    throw new Error("Seed users are required before loading leadops mock data.");
  }

  return {
    direction,
    statuses: { projectActive, projectPlanning, projectCompleted, taskTodo, taskProgress, taskDone },
    users
  };
}

async function main() {
  await cleanupTestData();
  const { direction, statuses, users } = await ensureBaseEntities();

  for (const stage of stages) {
    await prisma.crmStage.upsert({
      where: { externalId: stage.externalId },
      create: { ...stage, rawPayload: { source: "test-seed" }, lastSyncedAt: new Date() },
      update: { ...stage, rawPayload: { source: "test-seed" }, lastSyncedAt: new Date() }
    });
  }

  const workers = await Promise.all(
    [
      { fullName: "Анна Сидорова", bitrixUserExternalId: "TEST-WORKER-101", username: "anna_reports", chatId: "test-chat-101", userIndex: 2 },
      { fullName: "Мария Кузнецова", bitrixUserExternalId: "TEST-WORKER-102", username: "maria_reports", chatId: "test-chat-102", userIndex: 3 },
      { fullName: "Петр Иванов", bitrixUserExternalId: "TEST-WORKER-103", username: "petr_reports", chatId: "test-chat-103", userIndex: 1 },
      { fullName: "Дмитрий Павлов", bitrixUserExternalId: "TEST-WORKER-104", username: "dmitry_reports", chatId: "test-chat-104", userIndex: 4 }
    ].map(async (worker) => {
      const savedWorker = await prisma.externalWorker.create({
        data: {
          fullName: worker.fullName,
          bitrixUserExternalId: worker.bitrixUserExternalId,
          userId: users[worker.userIndex % users.length]?.id,
          timezone: "Asia/Novosibirsk",
          workdayStart: "09:00",
          workdayEnd: "18:00",
          status: "active",
          notes: "Тестовый сотрудник для демонстрации LeadOps"
        }
      });

      const account = await prisma.messengerAccount.create({
        data: {
          workerId: savedWorker.id,
          provider: "telegram",
          externalUserId: worker.bitrixUserExternalId.replace("TEST-WORKER-", "tg-user-"),
          externalChatId: worker.chatId,
          username: worker.username,
          displayName: worker.fullName,
          isVerified: worker.bitrixUserExternalId !== "TEST-WORKER-104",
          verifiedAt: worker.bitrixUserExternalId !== "TEST-WORKER-104" ? daysFromNow(-9, 12) : null,
          lastInboundAt: daysFromNow(-1, 17),
          rawPayload: { source: "test-seed" }
        }
      });

      await prisma.botConversationState.create({
        data: {
          provider: "telegram",
          externalChatId: worker.chatId,
          state: "daily_report_waiting",
          context: { source: "test-seed", worker: worker.fullName },
          expiresAt: daysFromNow(1, 18)
        }
      });

      return { ...savedWorker, account };
    })
  );
  const workerByExternalId = new Map(workers.map((worker) => [worker.bitrixUserExternalId, worker]));

  const savedLeads = [];
  for (const [index, lead] of leadSpecs.entries()) {
    const lifecycleStatus = lead.stageExternalId === "TEST_WON" ? "converted" : lead.stageExternalId === "TEST_LOST" ? "failed" : "active";
    const savedLead = await prisma.crmLead.create({
      data: {
        externalId: lead.externalId,
        title: lead.title,
        stageExternalId: lead.stageExternalId,
        lifecycleStatus,
        amount: lead.amount,
        currency: "RUB",
        source: lead.source,
        assignedByExternalId: lead.assignedByExternalId,
        assignedByName: lead.assignedByName,
        contactName: lead.contactName,
        contactPhone: lead.contactPhone,
        contactEmail: lead.contactEmail,
        comments: lead.comments,
        customerPath: lead.customerPath,
        lossReason: "lossReason" in lead ? lead.lossReason : null,
        bitrixCreatedAt: daysFromNow(-24 + index, 9),
        bitrixUpdatedAt: daysFromNow(-Math.min(index, 7), 11),
        lastSyncedAt: new Date(),
        rawPayload: { source: "test-seed", externalId: lead.externalId, company: lead.company }
      }
    });
    savedLeads.push({ ...lead, id: savedLead.id, lifecycleStatus });
  }

  for (const [index, lead] of savedLeads.entries()) {
    const responsibleUser = users[(index + 2) % users.length] ?? users[0];
    const projectStatus = lead.lifecycleStatus === "converted" ? statuses.projectCompleted : index % 3 === 0 ? statuses.projectPlanning : statuses.projectActive;

    const client = await prisma.client.create({
      data: {
        name: lead.company,
        contactPerson: lead.contactName,
        phone: lead.contactPhone,
        email: `leadops-${lead.externalId.toLowerCase()}@example.test`,
        source: lead.source,
        status: lead.lifecycleStatus === "failed" ? "lost" : "active",
        crmLeadId: lead.id
      }
    });

    const project = await prisma.project.create({
      data: {
        name: `LeadOps: ${lead.title}`,
        clientId: client.id,
        crmLeadId: lead.id,
        responsibleUserId: responsibleUser.id,
        directionId: direction.id,
        statusId: projectStatus.id,
        startDate: daysFromNow(-18 + index, 9),
        plannedEndDate: daysFromNow(18 + index, 18),
        actualEndDate: lead.lifecycleStatus === "converted" ? daysFromNow(-2, 18) : null,
        budget: String(Number(lead.amount) || 300000),
        description: `Связанный проект для лида ${lead.externalId}`
      }
    });

    const activitySpecs = [
      {
        suffix: "CALL",
        subject: "Позвонить клиенту и уточнить потребности",
        deadline: daysFromNow(index === 0 ? -1 : index + 1, 10),
        status: lead.lifecycleStatus === "converted" || lead.lifecycleStatus === "failed" ? "completed" : "pending",
        completed: lead.lifecycleStatus === "converted" || lead.lifecycleStatus === "failed"
      },
      {
        suffix: "MATERIALS",
        subject: "Подготовить материалы для следующего шага",
        deadline: daysFromNow(index + 3, 15),
        status: "pending",
        completed: false
      },
      {
        suffix: "MEETING",
        subject: "Провести встречу по решению",
        deadline: daysFromNow(index + 6, 11),
        status: index % 5 === 0 ? "canceled" : "pending",
        completed: false
      }
    ] as const;

    const activities = [];
    for (const activity of activitySpecs) {
      activities.push(
        await prisma.crmActivity.create({
          data: {
            externalId: `${lead.externalId}-ACT-${activity.suffix}`,
            leadExternalId: lead.externalId,
            ownerTypeId: 1,
            typeId: activity.suffix === "CALL" ? 2 : 4,
            subject: activity.subject,
            description: `Автоматически созданное CRM-дело для ${lead.title}`,
            deadline: activity.deadline,
            startTime: activity.deadline,
            endTime: daysFromNow(index + 3, 16),
            status: activity.status,
            bitrixStatus: activity.completed ? "completed" : "pending",
            completed: activity.completed,
            responsibleExternalId: lead.assignedByExternalId,
            responsibleName: lead.assignedByName,
            bitrixCreatedAt: daysFromNow(-14 + index, 10),
            bitrixUpdatedAt: new Date(),
            lastSyncedAt: new Date(),
            rawPayload: { source: "test-seed", externalId: `${lead.externalId}-ACT-${activity.suffix}` }
          }
        })
      );
    }

    await prisma.task.createMany({
      data: [
        {
          projectId: project.id,
          crmLeadId: lead.id,
          title: "Подготовить коммерческое предложение",
          description: `Внутренняя задача по лиду ${lead.externalId}`,
          responsibleUserId: responsibleUser.id,
          statusId: index % 4 === 0 ? statuses.taskDone.id : statuses.taskProgress.id,
          priority: index % 3 === 0 ? "high" : "medium",
          plannedEndDate: daysFromNow(index + 2, 18),
          actualEndDate: index % 4 === 0 ? daysFromNow(-1, 18) : null,
          laborHours: "6.00"
        },
        {
          projectId: project.id,
          crmLeadId: lead.id,
          title: "Согласовать следующий шаг с клиентом",
          description: `Контроль follow-up по лиду ${lead.externalId}`,
          responsibleUserId: users[(index + 3) % users.length]?.id ?? responsibleUser.id,
          statusId: index % 5 === 0 ? statuses.taskTodo.id : statuses.taskProgress.id,
          priority: index % 2 === 0 ? "high" : "low",
          plannedEndDate: daysFromNow(index + 5, 18),
          laborHours: "4.00"
        }
      ]
    });

    for (const eventType of ["crm.lead.update", "crm.activity.add", "crm.timeline.comment.add"]) {
      await prisma.integrationEvent.create({
        data: {
          provider: "bitrix24",
          direction: eventType === "crm.timeline.comment.add" ? "outbound" : "inbound",
          eventType,
          externalId: lead.externalId,
          idempotencyKey: `test-seed:${lead.externalId}:${eventType}`,
          status: index % 7 === 0 && eventType === "crm.activity.add" ? "failed" : "processed",
          payload: { source: "test-seed", leadTitle: lead.title, eventType },
          errorMessage: index % 7 === 0 && eventType === "crm.activity.add" ? "Тестовая ошибка обработки webhook" : null,
          processedAt: new Date()
        }
      });
    }

    const commandStatus = index % 6 === 0 ? "failed" : index % 4 === 0 ? "queued" : "succeeded";
    await prisma.outboundCommand.create({
      data: {
        provider: "bitrix24",
        commandType: index % 3 === 0 ? "bitrix_update_lead_stage" : "bitrix_add_timeline_comment",
        status: commandStatus,
        idempotencyKey: `test-seed:outbound:${lead.externalId}`,
        leadId: lead.id,
        activityId: activities[0]?.id,
        payload: { source: "test-seed", leadExternalId: lead.externalId, comment: "Демо-команда для Bitrix24" },
        response: commandStatus === "succeeded" ? { result: true } : Prisma.JsonNull,
        attempts: commandStatus === "failed" ? 3 : 1,
        nextAttemptAt: commandStatus === "queued" || commandStatus === "failed" ? daysFromNow(1, 9) : null,
        sentAt: commandStatus === "succeeded" ? new Date() : null,
        errorMessage: commandStatus === "failed" ? "Тестовая ошибка отправки команды" : null
      }
    });

    const worker = workerByExternalId.get(lead.assignedByExternalId) ?? workers[index % workers.length];
    const workDate = dayStart(index % 2 === 0 ? 0 : -1);
    const plan = await prisma.workerDailyPlan.upsert({
      where: { workerId_workDate: { workerId: worker.id, workDate } },
      create: {
        workerId: worker.id,
        workDate,
        status: index % 3 === 0 ? "completed" : "sent",
        generatedAt: daysFromNow(-1, 8),
        sentAt: daysFromNow(-1, 9),
        summary: `План работы по лидам для ${worker.fullName}`
      },
      update: {
        status: index % 3 === 0 ? "completed" : "sent",
        sentAt: daysFromNow(-1, 9),
        summary: `План работы по лидам для ${worker.fullName}`
      }
    });

    const planItem = await prisma.workerDailyPlanItem.create({
      data: {
        planId: plan.id,
        leadId: lead.id,
        activityId: activities[0]?.id,
        status: index % 4 === 0 ? "done" : index % 5 === 0 ? "blocked" : "in_progress",
        title: `${lead.title}: следующий контакт`,
        dueAt: activities[0]?.deadline,
        sortOrder: index
      }
    });

    const reportStatus = index % 6 === 0 ? "missed" : "submitted";
    const report = await prisma.workerDailyReport.upsert({
      where: { workerId_workDate: { workerId: worker.id, workDate } },
      create: {
        workerId: worker.id,
        planId: plan.id,
        workDate,
        status: reportStatus,
        submittedAt: reportStatus === "submitted" ? new Date() : null,
        summary: reportStatus === "submitted" ? `Отчет по обработке лидов: ${lead.title}` : "Сотрудник не прислал отчет",
        rawPayload: { source: "test-seed", leadExternalId: lead.externalId }
      },
      update: {
        planId: plan.id,
        status: reportStatus,
        submittedAt: reportStatus === "submitted" ? new Date() : null,
        summary: reportStatus === "submitted" ? `Отчет по обработке лидов: ${lead.title}` : "Сотрудник не прислал отчет",
        rawPayload: { source: "test-seed", leadExternalId: lead.externalId }
      }
    });

    await prisma.workerReportItem.create({
      data: {
        reportId: report.id,
        planItemId: planItem.id,
        leadId: lead.id,
        activityId: activities[0]?.id,
        status: index % 4 === 0 ? "done" : index % 5 === 0 ? "blocked" : "in_progress",
        comment: `Комментарий сотрудника по лиду ${lead.externalId}`,
        needsManager: index % 5 === 0,
        nextActionAt: daysFromNow(index + 2, 10)
      }
    });

    const deliveryStatus = index % 5 === 0 ? "failed" : index % 3 === 0 ? "queued" : "sent";
    await prisma.messageDelivery.create({
      data: {
        messengerAccountId: worker.account.id,
        provider: "telegram",
        externalMessageId: deliveryStatus === "sent" ? `tg-msg-${lead.externalId}` : null,
        recipientChatId: worker.account.externalChatId,
        text: `План по лиду: ${lead.title}`,
        payload: { source: "test-seed", leadExternalId: lead.externalId },
        status: deliveryStatus,
        attempts: deliveryStatus === "failed" ? 3 : 1,
        nextAttemptAt: deliveryStatus === "queued" || deliveryStatus === "failed" ? daysFromNow(1, 9) : null,
        sentAt: deliveryStatus === "sent" ? new Date() : null,
        errorMessage: deliveryStatus === "failed" ? "Тестовая ошибка Telegram-доставки" : null
      }
    });
  }

  const missedReportLeads = await prisma.crmLead.findMany({
    where: { externalId: { in: ["TEST-LEAD-002", "TEST-LEAD-007"] } },
    select: { id: true, externalId: true, title: true },
    orderBy: { externalId: "asc" }
  });

  for (const [index, worker] of workers.slice(0, 2).entries()) {
    const workDate = dayStart(-(index + 2));
    const lead = missedReportLeads[index];
    const plan = await prisma.workerDailyPlan.create({
      data: {
        workerId: worker.id,
        workDate,
        status: "missed",
        generatedAt: daysFromNow(-(index + 3), 8),
        sentAt: daysFromNow(-(index + 3), 9),
        summary: `Missed daily plan for ${worker.fullName}`
      }
    });

    const planItem = await prisma.workerDailyPlanItem.create({
      data: {
        planId: plan.id,
        leadId: lead?.id,
        status: "postponed",
        title: `Missed follow-up: ${lead?.title ?? worker.fullName}`,
        dueAt: daysFromNow(-(index + 2), 15),
        sortOrder: 100 + index
      }
    });

    const report = await prisma.workerDailyReport.create({
      data: {
        workerId: worker.id,
        planId: plan.id,
        workDate,
        status: "missed",
        submittedAt: null,
        summary: "Daily report was not submitted in time",
        rawPayload: { source: "test-seed", reason: "missed-report-demo" }
      }
    });

    await prisma.workerReportItem.create({
      data: {
        reportId: report.id,
        planItemId: planItem.id,
        leadId: lead?.id,
        status: "postponed",
        comment: "Follow-up moved to the next working day",
        needsManager: true,
        nextActionAt: daysFromNow(1, 11)
      }
    });
  }

  await prisma.syncJob.createMany({
    data: [
      {
        provider: "bitrix24",
        jobType: "test-stages-sync",
        status: "succeeded",
        startedAt: daysFromNow(-2, 9),
        finishedAt: daysFromNow(-2, 9),
        stats: { stages: stages.length, source: "test-seed" }
      },
      {
        provider: "bitrix24",
        jobType: "test-leads-sync",
        status: "succeeded",
        startedAt: daysFromNow(-1, 10),
        finishedAt: daysFromNow(-1, 10),
        stats: { leads: leadSpecs.length, source: "test-seed" }
      },
      {
        provider: "bitrix24",
        jobType: "test-activities-sync",
        status: "failed",
        startedAt: daysFromNow(0, 8),
        finishedAt: daysFromNow(0, 8),
        stats: { activities: leadSpecs.length * 3, source: "test-seed" },
        errorMessage: "Тестовый сбой синхронизации одного дела"
      },
      {
        provider: "telegram",
        jobType: "test-daily-report-reminders",
        status: "succeeded",
        startedAt: daysFromNow(0, 9),
        finishedAt: daysFromNow(0, 9),
        stats: { messages: leadSpecs.length, source: "test-seed" }
      }
    ]
  });

  console.log(`LeadOps mock data loaded: ${leadSpecs.length} leads, ${workers.length} workers.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
