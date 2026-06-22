import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const roles = [
  ["admin", "Администратор", "Полный доступ к настройкам системы"],
  ["director", "Руководитель", "Просмотр аналитики и отчетов"],
  ["project_manager", "Руководитель проекта", "Работа с проектами и задачами"],
  ["client_manager", "Менеджер по клиентам", "Работа с клиентскими данными"],
  ["finance", "Финансовый специалист", "Работа с финансовыми показателями"],
  ["analyst", "Аналитик", "Аналитика, отчеты и проверка данных"]
] as const;

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.financialValue.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.reportPeriod.deleteMany();
  await prisma.status.deleteMany();
  await prisma.direction.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  const createdRoles = new Map<string, string>();
  for (const [code, name, description] of roles) {
    const role = await prisma.role.create({
      data: { code, name, description }
    });
    createdRoles.set(code, role.id);
  }

  const passwordHash = await bcrypt.hash("admin12345", 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        fullName: "Администратор системы",
        email: "admin@example.com",
        passwordHash,
        roleId: createdRoles.get("admin")!
      }
    }),
    prisma.user.create({
      data: {
        fullName: "Иванов Петр Петрович",
        email: "director@example.com",
        passwordHash: await bcrypt.hash("director12345", 10),
        roleId: createdRoles.get("director")!
      }
    }),
    prisma.user.create({
      data: {
        fullName: "Сидорова Анна Сергеевна",
        email: "pm@example.com",
        passwordHash: await bcrypt.hash("pm12345", 10),
        roleId: createdRoles.get("project_manager")!
      }
    }),
    prisma.user.create({
      data: {
        fullName: "Кузнецова Мария Игоревна",
        email: "analyst@example.com",
        passwordHash: await bcrypt.hash("analyst12345", 10),
        roleId: createdRoles.get("analyst")!
      }
    }),
    prisma.user.create({
      data: {
        fullName: "Павлов Дмитрий Олегович",
        email: "finance@example.com",
        passwordHash: await bcrypt.hash("finance12345", 10),
        roleId: createdRoles.get("finance")!
      }
    })
  ]);

  const [webDirection, supportDirection] = await Promise.all([
    prisma.direction.create({
      data: {
        name: "Веб-разработка",
        description: "Разработка и сопровождение web-проектов"
      }
    }),
    prisma.direction.create({
      data: {
        name: "Техническая поддержка",
        description: "Сервисное сопровождение клиентов"
      }
    })
  ]);

  const statuses = await Promise.all([
    prisma.status.create({
      data: { entityType: "project", code: "planning", name: "Планируется", color: "#64748b", sortOrder: 1 }
    }),
    prisma.status.create({
      data: { entityType: "project", code: "active", name: "В работе", color: "#2563eb", sortOrder: 2 }
    }),
    prisma.status.create({
      data: { entityType: "project", code: "completed", name: "Завершен", color: "#16a34a", isFinal: true, sortOrder: 3 }
    }),
    prisma.status.create({
      data: { entityType: "task", code: "todo", name: "К выполнению", color: "#64748b", sortOrder: 1 }
    }),
    prisma.status.create({
      data: { entityType: "task", code: "in_progress", name: "В работе", color: "#2563eb", sortOrder: 2 }
    }),
    prisma.status.create({
      data: { entityType: "task", code: "done", name: "Выполнена", color: "#16a34a", isFinal: true, sortOrder: 3 }
    }),
    prisma.status.create({
      data: { entityType: "client", code: "active", name: "Активный", color: "#16a34a", sortOrder: 1 }
    })
  ]);

  const projectActiveStatus = statuses.find((status) => status.entityType === "project" && status.code === "active")!;
  const projectPlanningStatus = statuses.find((status) => status.entityType === "project" && status.code === "planning")!;
  const taskTodoStatus = statuses.find((status) => status.entityType === "task" && status.code === "todo")!;
  const taskProgressStatus = statuses.find((status) => status.entityType === "task" && status.code === "in_progress")!;

  const [periodQ1, periodQ2, periodQ3] = await Promise.all([
    prisma.reportPeriod.create({
      data: {
        name: "I квартал 2026",
        dateFrom: new Date("2026-01-01"),
        dateTo: new Date("2026-03-31")
      }
    }),
    prisma.reportPeriod.create({
      data: {
        name: "II квартал 2026",
        dateFrom: new Date("2026-04-01"),
        dateTo: new Date("2026-06-30")
      }
    }),
    prisma.reportPeriod.create({
      data: {
        name: "III квартал 2026",
        dateFrom: new Date("2026-07-01"),
        dateTo: new Date("2026-09-30")
      }
    })
  ]);

  const [clientA, clientB] = await Promise.all([
    prisma.client.create({
      data: {
        name: "ООО «Альфа Проект»",
        contactPerson: "Смирнов Алексей",
        phone: "+7 383 200-10-10",
        email: "contact@alpha-project.test",
        source: "Рекомендация",
        status: "active"
      }
    }),
    prisma.client.create({
      data: {
        name: "АО «Сибирские решения»",
        contactPerson: "Николаева Елена",
        phone: "+7 383 200-20-20",
        email: "info@siberia-solutions.test",
        source: "Сайт",
        status: "active"
      }
    })
  ]);

  const [projectA, projectB] = await Promise.all([
    prisma.project.create({
      data: {
        name: "Корпоративный портал",
        clientId: clientA.id,
        responsibleUserId: users[2].id,
        directionId: webDirection.id,
        statusId: projectActiveStatus.id,
        startDate: new Date("2026-01-15"),
        plannedEndDate: new Date("2026-06-30"),
        budget: "1250000.00",
        description: "Разработка внутреннего портала для аналитической отчетности клиента"
      }
    }),
    prisma.project.create({
      data: {
        name: "Сервисная поддержка",
        clientId: clientB.id,
        responsibleUserId: users[2].id,
        directionId: supportDirection.id,
        statusId: projectPlanningStatus.id,
        startDate: new Date("2026-03-01"),
        plannedEndDate: new Date("2026-08-31"),
        budget: "650000.00",
        description: "Регламентная поддержка и обработка заявок"
      }
    })
  ]);

  const projectCompletedStatus = statuses.find((status) => status.entityType === "project" && status.code === "completed")!;
  const taskDoneStatus = statuses.find((status) => status.entityType === "task" && status.code === "done")!;
  const [projectC, projectD] = await Promise.all([
    prisma.project.create({
      data: {
        name: "Аналитический модуль",
        clientId: clientA.id,
        responsibleUserId: users[2].id,
        directionId: webDirection.id,
        statusId: projectCompletedStatus.id,
        startDate: new Date("2026-01-10"),
        plannedEndDate: new Date("2026-04-20"),
        actualEndDate: new Date("2026-04-18"),
        budget: "900000.00",
        description: "Завершенный проект для демонстрации аналитики"
      }
    }),
    prisma.project.create({
      data: {
        name: "Срочный аудит отчетности",
        clientId: clientB.id,
        responsibleUserId: users[2].id,
        directionId: supportDirection.id,
        statusId: projectActiveStatus.id,
        startDate: new Date("2026-05-01"),
        plannedEndDate: new Date("2026-06-02"),
        budget: "320000.00",
        description: "Проект с отрицательной прибылью для проблемного списка"
      }
    })
  ]);

  const extraClients = await Promise.all(
    [
      ["ООО «Городские сервисы»", "Орлова Ирина", "city-services.test"],
      ["АО «Вектор Плюс»", "Михайлов Денис", "vector-plus.test"],
      ["ООО «ТехноЛогика»", "Федорова Марина", "technologica.test"],
      ["ЗАО «Регион Аналитика»", "Ковалев Артем", "region-analytics.test"]
    ].map(([name, contactPerson, domain], index) =>
      prisma.client.create({
        data: {
          name,
          contactPerson,
          phone: `+7 383 300-4${index}-4${index}`,
          email: `contact@${domain}`,
          source: index % 2 === 0 ? "Сайт" : "Партнер",
          status: "active"
        }
      })
    )
  );

  const allClients = [clientA, clientB, ...extraClients];
  const projectSpecs = [
    ["CRM-интеграция", allClients[2].id, webDirection.id, projectActiveStatus.id, "2026-02-10", "2026-07-20", null, "780000.00"],
    ["Миграция отчетов", allClients[3].id, supportDirection.id, projectActiveStatus.id, "2026-03-05", "2026-06-08", null, "430000.00"],
    ["Портал заявок", allClients[4].id, webDirection.id, projectPlanningStatus.id, "2026-06-01", "2026-09-15", null, "980000.00"],
    ["Аудит качества данных", allClients[5].id, supportDirection.id, projectCompletedStatus.id, "2026-01-20", "2026-03-30", "2026-03-28", "360000.00"],
    ["Финансовый мониторинг", allClients[2].id, webDirection.id, projectActiveStatus.id, "2026-04-12", "2026-08-25", null, "1120000.00"],
    ["Регламентная поддержка BI", allClients[3].id, supportDirection.id, projectActiveStatus.id, "2026-05-02", "2026-05-24", null, "290000.00"]
  ] as const;
  const extraProjects = await Promise.all(
    projectSpecs.map(([name, clientId, directionId, statusId, startDate, plannedEndDate, actualEndDate, budget]) =>
      prisma.project.create({
        data: {
          name,
          clientId,
          responsibleUserId: users[2].id,
          directionId,
          statusId,
          startDate: new Date(startDate),
          plannedEndDate: new Date(plannedEndDate),
          actualEndDate: actualEndDate ? new Date(actualEndDate) : null,
          budget,
          description: `Демонстрационный проект: ${name}`
        }
      })
    )
  );
  const demoProjects = [projectA, projectB, projectC, projectD, ...extraProjects];

  await prisma.task.createMany({
    data: [
      {
        projectId: projectA.id,
        title: "Подготовить структуру данных",
        description: "Согласовать сущности и связи для первичной аналитики",
        responsibleUserId: users[3].id,
        statusId: taskProgressStatus.id,
        priority: "high",
        plannedEndDate: new Date("2026-05-30"),
        laborHours: "16.00"
      },
      {
        projectId: projectA.id,
        title: "Собрать исходные показатели",
        description: "Подготовить финансовые и проектные показатели",
        responsibleUserId: users[4].id,
        statusId: taskTodoStatus.id,
        priority: "medium",
        plannedEndDate: new Date("2026-06-05"),
        laborHours: "12.00"
      },
      {
        projectId: projectB.id,
        title: "Согласовать регламент отчетности",
        responsibleUserId: users[2].id,
        statusId: taskTodoStatus.id,
        priority: "medium",
        plannedEndDate: new Date("2026-06-15"),
        laborHours: "8.00"
      },
      {
        projectId: projectC.id,
        title: "Завершить демонстрационную аналитику",
        responsibleUserId: users[3].id,
        statusId: taskDoneStatus.id,
        priority: "medium",
        plannedEndDate: new Date("2026-04-15"),
        actualEndDate: new Date("2026-04-14"),
        laborHours: "18.00"
      },
      {
        projectId: projectD.id,
        title: "Подготовить проблемный отчет",
        responsibleUserId: users[3].id,
        statusId: taskProgressStatus.id,
        priority: "high",
        plannedEndDate: new Date("2026-05-10"),
        laborHours: "10.00"
      }
    ]
  });

  await prisma.task.createMany({
    data: demoProjects.flatMap((project, projectIndex) =>
      Array.from({ length: 3 }, (_, taskIndex) => {
        const isDone = (projectIndex + taskIndex) % 4 === 0;
        const isProgress = (projectIndex + taskIndex) % 3 === 0;
        return {
          projectId: project.id,
          title: `Демо-задача ${projectIndex + 1}.${taskIndex + 1}`,
          description: "Задача создана seed-данными для демонстрации CRUD, просрочек и аналитики",
          responsibleUserId: users[(taskIndex % 3) + 2].id,
          statusId: isDone ? taskDoneStatus.id : isProgress ? taskProgressStatus.id : taskTodoStatus.id,
          priority: taskIndex === 0 ? "high" : taskIndex === 1 ? "medium" : "low",
          plannedEndDate: new Date(2026, 4 + (projectIndex % 4), 8 + taskIndex * 5),
          actualEndDate: isDone ? new Date(2026, 4 + (projectIndex % 4), 7 + taskIndex * 5) : null,
          laborHours: `${8 + projectIndex + taskIndex * 2}.00`
        };
      })
    )
  });

  await prisma.financialValue.createMany({
    data: [
      {
        projectId: projectA.id,
        periodId: periodQ1.id,
        type: "planned_income",
        amount: "500000.00",
        comment: "Плановая выручка за I квартал",
        date: new Date("2026-03-31"),
        createdById: users[4].id
      },
      {
        projectId: projectA.id,
        periodId: periodQ1.id,
        type: "income",
        amount: "470000.00",
        comment: "Фактическая выручка за I квартал",
        date: new Date("2026-03-31"),
        createdById: users[4].id
      },
      {
        projectId: projectA.id,
        periodId: periodQ2.id,
        type: "expense",
        amount: "180000.00",
        comment: "Расходы на разработку",
        date: new Date("2026-05-20"),
        createdById: users[4].id
      },
      {
        projectId: projectB.id,
        periodId: periodQ2.id,
        type: "planned_income",
        amount: "250000.00",
        comment: "Плановая выручка по поддержке",
        date: new Date("2026-06-30"),
        createdById: users[4].id
      },
      {
        projectId: projectC.id,
        periodId: periodQ2.id,
        type: "income",
        amount: "820000.00",
        comment: "Фактическая выручка завершенного проекта",
        date: new Date("2026-04-18"),
        createdById: users[4].id
      },
      {
        projectId: projectC.id,
        periodId: periodQ2.id,
        type: "expense",
        amount: "420000.00",
        comment: "Расходы завершенного проекта",
        date: new Date("2026-04-18"),
        createdById: users[4].id
      },
      {
        projectId: projectD.id,
        periodId: periodQ2.id,
        type: "income",
        amount: "120000.00",
        comment: "Частичная оплата",
        date: new Date("2026-05-18"),
        createdById: users[4].id
      },
      {
        projectId: projectD.id,
        periodId: periodQ2.id,
        type: "expense",
        amount: "210000.00",
        comment: "Расходы выше дохода",
        date: new Date("2026-05-22"),
        createdById: users[4].id
      }
    ]
  });

  await prisma.financialValue.createMany({
    data: demoProjects.flatMap((project, index) => {
      const period = index % 3 === 0 ? periodQ1 : index % 3 === 1 ? periodQ2 : periodQ3;
      const income = 180000 + index * 85000;
      const expense = index % 4 === 0 ? income + 40000 : Math.round(income * 0.58);
      return [
        {
          projectId: project.id,
          periodId: period.id,
          type: "income" as const,
          amount: `${income}.00`,
          comment: "Seed: фактический доход",
          date: new Date(2026, 2 + (index % 6), 20),
          createdById: users[4].id
        },
        {
          projectId: project.id,
          periodId: period.id,
          type: "expense" as const,
          amount: `${expense}.00`,
          comment: "Seed: расходы проекта",
          date: new Date(2026, 2 + (index % 6), 22),
          createdById: users[4].id
        },
        {
          projectId: project.id,
          periodId: period.id,
          type: "planned_income" as const,
          amount: `${income + 50000}.00`,
          comment: "Seed: плановый доход",
          date: new Date(2026, 2 + (index % 6), 1),
          createdById: users[4].id
        }
      ];
    })
  });

  await prisma.report.create({
    data: {
      title: "Демонстрационный отчет по проектам",
      description: "Настройки отчета для проверки seed-данных",
      type: "projects",
      filters: { period: periodQ2.name },
      createdById: users[3].id
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: users[0].id,
      action: "create",
      entityType: "seed",
      entityId: "iteration-01",
      newValue: { message: "Demo data created" }
    }
  });
}

main()
  .then(async () => {
    console.log("Seed data created successfully.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
