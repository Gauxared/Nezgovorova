# LeadOps Risk Register

| Risk | Impact | Probability | Owner | Mitigation |
| --- | --- | --- | --- | --- |
| Bitrix24 webhooks send only object IDs, not full records | Medium | High | Backend | Always fetch full entity after webhook event |
| Bitrix field names/custom fields differ from screenshots | High | High | Backend + Bitrix owner | Store raw payloads and run `crm.lead.fields` discovery before schema finalization |
| Wrong worker-to-lead mapping | High | Medium | Business owner | Confirm mapping rules before daily plan generation |
| Telegram exposes personal data to the wrong chat | High | Medium | Backend | Require verified chat binding and avoid manual chat ID entry |
| Duplicate webhook/pull processing creates duplicate records | High | Medium | Backend | Use external IDs, unique constraints and idempotency keys |
| Bitrix API limits or overload errors break sync | Medium | Medium | Backend | Add pagination, retry policy, rate limiting and sync job status |
| Workers answer in free text instead of structured buttons | Medium | High | Product/backend | Prefer inline buttons, allow comment fallback |
| Stage write-back from Telegram corrupts CRM process | High | Medium | Business owner + backend | Keep stage write-back disabled until explicit rules exist |
| Local analytics becomes stale | Medium | Medium | Backend/frontend | Show `lastSyncedAt` and sync job status in UI |
| Existing project docs/code use mixed encoding | Low | High | Technical owner | Keep new agent-facing docs in ASCII until encoding policy is fixed |
