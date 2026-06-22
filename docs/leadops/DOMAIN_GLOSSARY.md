# LeadOps Domain Glossary

## Purpose

This glossary fixes the vocabulary for the LeadOps rebuild. Use these terms in code, database models, API routes, tasks and agent prompts.

## Core Terms

| Term | Definition | Source of truth |
| --- | --- | --- |
| Lead | CRM object representing a potential client or business opportunity before conversion. | Bitrix24 |
| Lead stage | Current step of lead processing pipeline. Visible examples: `New/Search contact`, `Intro email sent`, `Meeting completed`, `Negotiations`, `Pilot discussion`, `Presale`, `Finish lead processing`. | Bitrix24 |
| Activity | CRM work item around a lead: call, email, task, meeting, waiting state or similar item from Bitrix24 activities/timeline. | Bitrix24 |
| Responsible user | Bitrix24 user assigned to the lead or activity. | Bitrix24 |
| External worker | Company contractor or external employee who handles assigned leads mostly through Telegram. | Our System |
| Messenger account | Verified Telegram identity linked to an external worker. | Our System |
| Daily plan | Morning package of lead/activity items sent to a worker for the current workday. | Our System |
| Daily report | Evening structured report collected from a worker about progress, blockers and next steps. | Our System |
| Report item | One answer inside a daily report, linked to a lead or activity. | Our System |
| Write-back | Controlled outbound change from Our System to Bitrix24, for example comment, activity completion or next task. | Our System initiates, Bitrix24 stores result |
| Integration event | Technical record of inbound/outbound integration traffic and processing result. | Our System |
| Raw payload | Original JSON received from Bitrix24 or Telegram before normalization. | Our System |

## Boundary Decisions

- Bitrix24 remains the source of truth for CRM lead identity, lead stage, CRM contact data and CRM activity data.
- Our System is the source of truth for worker identity, Telegram binding, daily plans, daily reports, local processing state and analytics snapshots.
- Telegram is only a transport/channel for workers, not the source of truth.
- Webhook events from Bitrix24 should be treated as change notifications. For lead and activity events, the handler receives an `ID`, then Our System must fetch the full entity through REST API.
- First MVP should not allow arbitrary stage changes from Telegram. Stage write-back requires explicit business rules.

## Naming Rules

- Use `crmLead` or `CrmLead` for normalized Bitrix lead copies.
- Use `externalWorker` or `ExternalWorker` for people working through Telegram.
- Use `activity` only for Bitrix CRM activities, not generic internal tasks.
- Use `dailyPlan` and `dailyReport` for Telegram work cycles.
- Use `syncJob` for pull or webhook-triggered data sync operations.
