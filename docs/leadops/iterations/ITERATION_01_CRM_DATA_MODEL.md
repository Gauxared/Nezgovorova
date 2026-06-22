# Iteration 01 - CRM Data Model

## Goal

Добавить доменную модель для лидов, CRM-активностей, внешних сотрудников, Telegram-аккаунтов и интеграционных событий.

## Scope

- Расширить Prisma schema новыми моделями `CrmLead`, `CrmContact`, `CrmStage`, `CrmActivity`, `ExternalWorker`, `MessengerAccount`, `WorkerDailyReport`, `IntegrationEvent`.
- Добавить внешние id Bitrix24 и уникальные индексы.
- Добавить raw payload поля для CRM-сущностей или отдельную raw-таблицу.
- Создать миграцию.
- Добавить seed с несколькими демо-лидами из сценария Bitrix24.
- Добавить read-only API для списка лидов и карточки лида.

## Out of scope

- Не подключать реальный Bitrix24 API.
- Не писать Telegram bot.
- Не делать запись обратно в Bitrix24.
- Не строить финальную аналитику.

## Definition of Done

- `npx prisma migrate dev` создает новые таблицы.
- `npm run seed` заполняет демо-лиды.
- Backend имеет endpoint списка лидов.
- Backend имеет endpoint карточки лида.
- Существующие endpoints не ломаются.

## Verification

```bash
cd backend
npm run prisma:generate
npx prisma migrate dev
npm run seed
npm run build
```

Ручная проверка:

- открыть `GET /api/health`;
- получить список лидов через новый API;
- проверить, что у лида есть стадия, ответственный, контакт и активности.

