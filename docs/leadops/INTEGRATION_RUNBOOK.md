# LeadOps Integration Runbook

## Current State

The repository now contains a forward implementation scaffold for all planned LeadOps iterations. It can run without real Bitrix24 and Telegram tokens, but live sync/delivery endpoints return configuration errors until secrets are provided.

## Required Environment Variables

Backend:

```env
DATABASE_URL="postgresql://analytics_user:analytics_password@127.0.0.1:5432/analytics_reporting?schema=public"
JWT_SECRET="change-me"
FRONTEND_URL="http://localhost:5173"
PORT=4000

BITRIX_WEBHOOK_URL="https://example.bitrix24.ru/rest/1/webhook/"
TELEGRAM_BOT_TOKEN="123456:telegram-token"
TELEGRAM_WEBHOOK_SECRET="random-shared-secret"
```

Frontend:

```env
VITE_API_URL="http://localhost:4000/api"
```

## Local Verification Before Tokens

Run from `backend/`:

```bash
npm run build
npx prisma validate
npx prisma generate
```

Run from `frontend/`:

```bash
npm run build
```

## Live Bitrix24 Setup

1. Create an incoming webhook or local app with CRM scope.
2. Put the webhook base URL into `BITRIX_WEBHOOK_URL`.
3. Confirm these REST methods work:
   `crm.lead.fields`, `crm.lead.list`, `crm.lead.get`, `crm.status.list`, `crm.activity.list`, `crm.activity.get`, `crm.activity.fields`.
4. Configure Bitrix event handlers to call:
   `POST https://your-public-backend/api/bitrix/webhook`.
5. Bind these events first:
   `ONCRMLEADADD`, `ONCRMLEADUPDATE`, `ONCRMLEADDELETE`, `onCrmActivityAdd`, `onCrmActivityUpdate`.
6. Run manual sync from UI `LeadOps -> Sync Bitrix` or API `POST /api/bitrix/sync`.

## Live Telegram Setup

1. Create bot through BotFather.
2. Put token into `TELEGRAM_BOT_TOKEN`.
3. Generate a strong `TELEGRAM_WEBHOOK_SECRET`.
4. Configure Telegram webhook to:
   `POST https://your-public-backend/api/telegram/webhook`
   with the same secret token header.
5. Create an external worker in `POST /api/leadops/workers`.
6. Ask the worker to open:
   `https://t.me/<bot_username>?start=<workerId>`.
7. The bot will verify and bind Telegram chat to the worker.

## Operational Checks

- `GET /api/bitrix/status` shows Bitrix configuration and recent sync jobs.
- `GET /api/telegram/status` shows Telegram configuration and message queue health.
- `GET /api/leadops/analytics/summary` shows CRM/worker metrics.
- `POST /api/telegram/deliver` manually flushes queued Telegram messages.
- `POST /api/bitrix/commands/process` manually processes queued Bitrix write-back commands.

## Security Notes

- Do not store Bitrix or Telegram tokens in docs or git.
- Do not expose Telegram webhook without `TELEGRAM_WEBHOOK_SECRET`.
- Keep stage write-back disabled by process until business rules are approved.
- Store raw payloads only as long as needed for integration debugging.
- Check PII rules before sending phone/email/contact data into Telegram.

## Known Local Constraint

`prisma migrate dev` currently fails with `P3014` because the local PostgreSQL user cannot create a shadow database. The local schema was applied with:

```bash
npx prisma db push
```

The generated SQL migration is stored at:

```text
backend/prisma/migrations/20260601000000_leadops_data_model/migration.sql
```
