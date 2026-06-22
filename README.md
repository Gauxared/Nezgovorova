# Информационная система аналитической отчетности

Fullstack web-приложение для аналитической отчетности ООО «7 Красных линий». Система объединяет клиентов, проекты, задачи, финансы, отчеты, импорт CSV, экспорт, журнал действий, работу с лидами, внешними сотрудниками и интеграциями Bitrix24/Telegram.

## Демо На GitHub Pages

GitHub Pages публикует только статический frontend, поэтому для публичного показа добавлен demo-режим без подключения к backend и PostgreSQL. В нем доступны вход, раздел лидов, карточки лидов, показатели, задачи, внешние сотрудники, очереди Telegram/Bitrix24, события и ошибки интеграций.

Данные для входа:

```text
admin@example.com / admin12345
```

Workflow `.github/workflows/pages.yml` собирает frontend с переменными:

```text
VITE_DEMO_MODE=true
BASE_PATH=/<имя-репозитория>/
```

После push в ветку `main` GitHub Actions публикует результат в GitHub Pages. Полноценный режим с API и базой данных запускается локально по инструкции ниже.

## Стек

- Frontend: React, TypeScript, Vite, React Router, Recharts.
- Backend: Node.js, TypeScript, Express, Prisma, JWT, bcrypt.
- Database: PostgreSQL.
- DevOps: Docker Compose для PostgreSQL.

## Структура

```text
backend/          Express API, Prisma schema, seed
frontend/         React application
docs/             проектные документы, итерации, demo-сценарий
docs/import_samples/
docker-compose.yml
```

## Запуск Через Docker

```bash
docker compose up -d
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

В отдельном терминале:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5175` или `http://127.0.0.1:5175`  
Backend: `http://localhost:4001`  
Health check: `http://localhost:4001/api/health`

Если PowerShell блокирует `npm.ps1`, используйте `npm.cmd` вместо `npm`.

## Тестовые Пользователи

```text
admin@example.com / admin12345
director@example.com / director12345
pm@example.com / pm12345
analyst@example.com / analyst12345
finance@example.com / finance12345
```

## Роли

- `admin` — полный доступ, справочники, импорт, журнал.
- `director` — dashboard, отчеты, просмотр проектных и финансовых данных.
- `project_manager` — проекты и задачи.
- `client_manager` — клиенты.
- `finance` — финансовые записи.
- `analyst` — dashboard, отчеты, импорт и audit log.

## Основные Возможности

- JWT-вход и защищенные маршруты.
- CRUD: клиенты, проекты, задачи, финансовые записи.
- Справочники: статусы, направления, отчетные периоды.
- Dashboard с backend-расчетом KPI и графиками.
- Отчеты с сохранением настроек и пересчетом данных при открытии.
- CSV-экспорт отчетов.
- CSV-импорт клиентов, проектов, задач и финансовых записей.
- Audit log для login/create/update/delete/import/export.
- Раздел лидов с mock-данными CRM, Telegram-планами, отчетами, очередями сообщений и состоянием интеграций.

## CSV Импорт

Примеры файлов лежат в `docs/import_samples`.

Ожидаемые колонки:

- clients: `name;contactPerson;phone;email;source;status`
- projects: `name;clientId;responsibleUserId;directionId;statusId;startDate;plannedEndDate;actualEndDate;budget;description`
- tasks: `projectId;title;description;responsibleUserId;statusId;priority;plannedEndDate;actualEndDate;laborHours`
- financial-values: `projectId;periodId;type;amount;date;comment`

## Demo-Сценарий

1. Войти под `admin@example.com / admin12345`.
2. Открыть dashboard: KPI, графики, просроченные задачи, проблемные проекты.
3. Создать клиента.
4. Создать проект для клиента.
5. Создать задачу.
6. Добавить финансовую запись.
7. Вернуться на dashboard и показать обновление аналитики.
8. Создать финансовый отчет с фильтрами.
9. Открыть отчет и экспортировать CSV.
10. Импортировать CSV клиента.
11. Открыть журнал действий и показать login/create/export/import.
12. Войти под ограниченной ролью и показать скрытие недоступных разделов.

## Проверки

```bash
cd backend
npm run build
```

```bash
cd frontend
npm run build
```

Для проверки статического demo-режима:

```bash
cd frontend
VITE_DEMO_MODE=true BASE_PATH=/Nezgovorova/ npm run build
```

## Ограничения

- Docker Desktop на текущем ПК может не устанавливаться без Windows-компонента `VirtualMachinePlatform`; для локальной проверки можно использовать обычный PostgreSQL.
- XLSX и PDF экспорт не реализованы, CSV закрывает демонстрационный сценарий.
- Нет refresh token и восстановления пароля.
- Нет drag-and-drop конструктора отчетов и пользовательских формул.
- GitHub Pages показывает demo-frontend; backend/API/PostgreSQL требуют отдельного хостинга.
