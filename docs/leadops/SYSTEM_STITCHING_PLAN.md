# LeadOps System Stitching Plan

## Principle

`CrmLead` is the central operational object. Existing system entities stay useful, but they should connect to leads instead of forming a separate business universe.

## Implemented Links

- `Client.crmLeadId -> CrmLead.id`
- `Project.crmLeadId -> CrmLead.id`
- `Task.crmLeadId -> CrmLead.id`
- `ExternalWorker.userId -> User.id`
- `CrmActivity.leadExternalId -> CrmLead.externalId`
- `WorkerReportItem.leadId/activityId -> CrmLead/CrmActivity`
- `OutboundCommand.leadId/activityId -> CrmLead/CrmActivity`

## Navigation Model

- `LeadOps` is the operating center.
- Lead details page is the unified object card.
- Existing `Clients`, `Projects`, `Tasks` remain available and can now be linked to CRM leads.
- Integration health is visible inside `LeadOps`, not only in raw logs.

## Business Rules

- Bitrix24 remains source of truth for lead identity, stage, contact fields and CRM activities.
- Our System remains source of truth for external workers, Telegram bindings, daily plans and daily reports.
- Telegram is a work channel, not a database of record.
- Internal `Task` is not the same as Bitrix `CrmActivity`.
- Internal `Task` can reference a lead when manager-side work is required.
- `Client` can reference a lead when a CRM lead becomes or represents a known client.
- `Project` can reference a lead when a lead becomes a delivery/project track.
- Stage changes from Telegram stay disabled until explicit rules are approved.
- Bitrix write-back must go through `OutboundCommand`.
- Webhook payloads are change notifications; full records must be fetched before normalization.

## UI Direction

Recommended future menu:

- `Рабочий стол`
- `LeadOps`
- `Лиды`
- `Задачи`
- `Сотрудники`
- `Клиенты`
- `Отчеты`
- `Интеграции`
- `Справочники`
- `Журнал`

For now, `LeadOps` contains:

- CRM metrics
- recent leads
- unified tasks
- external workers
- integration admin
- lead details page

## Next Live-Test Rules

After real tokens are provided:

1. Run `crm.lead.fields` and compare fields with `BITRIX_FIELD_MAP.md`.
2. Run `POST /api/bitrix/sync`.
3. Open `LeadOps` and verify pipeline counts.
4. Create one external worker and bind Telegram through `/start <workerId>`.
5. Queue daily plans from `LeadOps`.
6. Flush Telegram queue through `POST /api/telegram/deliver`.
7. Submit one evening report.
8. Queue one Bitrix timeline comment.
9. Process Bitrix outbound commands.
10. Open lead details and verify that all events are visible in one card.
