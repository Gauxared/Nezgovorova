# Iteration 07 - Operations, Security and Demo Readiness

## Goal

Prepare the forward LeadOps scaffold for live Bitrix24/Telegram credentials and repeatable local verification.

## Implemented Artifacts

- `docs/leadops/INTEGRATION_RUNBOOK.md`
- Backend diagnostics:
  - `GET /api/bitrix/status`
  - `GET /api/telegram/status`
  - `GET /api/leadops/analytics/summary`
- Manual processing endpoints:
  - `POST /api/bitrix/sync`
  - `POST /api/telegram/deliver`
  - `POST /api/bitrix/commands/process`

## Security Decisions

- Bitrix24 write-back is queued through `OutboundCommand`, not executed directly from Telegram.
- Telegram webhook can require `TELEGRAM_WEBHOOK_SECRET`.
- Tokens are read from environment variables only.
- Raw payloads are stored for early integration debugging and should get a retention policy before production use.

## Known Constraint

Local `prisma migrate dev` fails with `P3014` because the current PostgreSQL user cannot create a shadow database.

For this local database the schema was applied with:

```bash
npx prisma db push
```

The generated SQL migration is stored in:

```text
backend/prisma/migrations/20260601000000_leadops_data_model/migration.sql
```

## Verification

```bash
cd backend
npm run build
npx prisma validate
```

```bash
cd frontend
npm run build
```

Manual live verification starts after `BITRIX_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` are provided.
