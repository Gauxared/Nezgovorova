# Iteration 00 - Audit and Domain Discovery

## Goal

Formalize the new domain before coding:
`Bitrix24 CRM -> Our System -> Telegram -> Our System -> Bitrix24 CRM`.

## Scope

- Capture business terms and boundaries:
  `lead`, `stage`, `activity`, `external worker`, `daily plan`, `daily report`.
- Define source of truth per data block:
  lead data, stage dictionary, responsible user, worker report statuses.
- Build first API map for Bitrix24 methods/events required for MVP.
- Fix MVP process steps end-to-end:
  ingest lead data, morning reminder, evening report, basic analytics.
- Produce a blocking-question list for Bitrix owner and business owner.

## Bitrix24 API Discovery Baseline

Methods to verify first:

- `crm.lead.fields`
- `crm.lead.list` (or `crm.item.list` fallback if lead scope is restricted)
- `crm.lead.get`
- `crm.status.list` (lead stage dictionary + semantic)
- `crm.activity.list`
- `crm.activity.fields`
- `crm.lead.contact.items.get`
- `crm.contact.list`

Events to verify first:

- `onCrmLeadAdd`
- `onCrmLeadUpdate`
- `onCrmLeadDelete`
- `onCrmActivityAdd`
- `onCrmActivityUpdate`

Notes:

- Exact available methods depend on portal version, app scope and auth mode.
- Iteration 00 validates method/event feasibility and payload contracts only.

## Out of Scope

- No live Bitrix24 integration implementation.
- No Telegram bot implementation.
- No Prisma schema changes.
- No frontend redesign.

## Definition of Done

- Domain glossary is fixed and unambiguous.
- Source-of-truth matrix is written.
- Bitrix method/event shortlist is validated against docs.
- Required fields for first synchronization wave are listed.
- Business and integration open questions are listed and prioritized.
- Risk register exists with owner and mitigation per risk.

## Artifacts

- `docs/leadops/DOMAIN_GLOSSARY.md`
- `docs/leadops/SOURCE_OF_TRUTH.md`
- `docs/leadops/BITRIX_FIELD_MAP.md`
- `docs/leadops/MVP_WORKFLOW.md`
- `docs/leadops/OPEN_QUESTIONS.md`
- `docs/leadops/RISK_REGISTER.md`

## Verification

- Manual review by product/owner.
- Every term in Iteration 01+ docs uses the same definitions.
- No implementation starts until all `Priority-1` open questions are resolved.
