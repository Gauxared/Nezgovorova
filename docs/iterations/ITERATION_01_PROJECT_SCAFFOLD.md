# Iteration 01 — Project Scaffold, Database and Seed

## Goal

Создать рабочий каркас fullstack-приложения для информационной системы аналитической отчетности.

После завершения итерации проект должен запускаться локально, PostgreSQL должен подниматься через Docker, миграции должны применяться, seed-данные должны загружаться, frontend и backend должны стартовать без ошибок.

## Scope

### Repository structure

Создать:

```text
/frontend
/backend
/docker-compose.yml
/README.md
/docs
```

### Backend

- Node.js + TypeScript;
- Express или NestJS;
- Prisma;
- PostgreSQL;
- env-конфигурация;
- базовая структура модулей.

Рекомендуемая структура:

```text
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    index.ts
    app.ts
    config/
    common/
    modules/
    prisma/
```

### Database

Prisma-модели:

- Role;
- User;
- Client;
- Project;
- Task;
- FinancialValue;
- Direction;
- Status;
- ReportPeriod;
- Report;
- AuditLog.

### Seed data

Добавить:

- роли;
- администратора;
- пользователей разных ролей;
- клиентов;
- проекты;
- задачи;
- финансовые записи;
- отчетные периоды;
- статусы;
- направления.

Тестовый администратор:

```text
email: admin@example.com
password: admin12345
```

### Frontend

- React + TypeScript + Vite;
- React Router;
- базовый Layout;
- страницы: `/login`, `/dashboard`, `/clients`, `/projects`, `/tasks`, `/finance`, `/reports`, `/admin`.

## Out of scope

Не делать:

- полноценную авторизацию;
- JWT;
- ролевой доступ;
- сложный dashboard;
- CRUD-интерфейсы;
- экспорт и импорт;
- сложные графики;
- финальный UI.

## Definition of Done

- есть `/frontend` и `/backend`;
- PostgreSQL запускается через Docker Compose;
- backend подключается к БД;
- Prisma schema создана;
- миграции применяются;
- seed создает demo-данные;
- frontend запускается;
- backend запускается;
- базовые маршруты frontend существуют;
- README содержит команды запуска;
- нет критических TypeScript-ошибок.

## Verification commands

```bash
docker compose up -d
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

## Notes for Codex

- Не добавляй функции следующих итераций.
- Если выбираешь Express или NestJS, зафиксируй решение в `docs/DECISIONS.md`.

## Общий формат ответа Codex после реализации

Codex должен указать:

- что сделано;
- какие файлы созданы или изменены;
- какие команды проверки выполнены;
- какие пункты Definition of Done выполнены;
- какие ограничения или проблемы остались.
