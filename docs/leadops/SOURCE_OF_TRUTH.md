# LeadOps Source of Truth Matrix

## Matrix

| Data block | Source of truth | Local storage | Write policy |
| --- | --- | --- | --- |
| Lead ID/title/stage/source/amount | Bitrix24 | Normalized copy + raw payload | Read from Bitrix24; update only through approved outbound commands |
| Lead stage dictionary | Bitrix24 | Cached `CrmStage` rows | Refresh from `crm.status.list` with `ENTITY_ID: STATUS` |
| Contact name/phone/email | Bitrix24 | Normalized copy + raw payload | Read-only in MVP |
| Activity subject/deadline/status/responsible | Bitrix24 | Normalized copy + raw payload | MVP may mark completion only after explicit approval rules |
| Responsible Bitrix user | Bitrix24 | Cached user reference | Read-only in MVP |
| External worker profile | Our System | Primary table | Managed in Our System |
| Telegram chat/user binding | Our System | Primary table | Verified through bot start/link flow |
| Morning daily plan | Our System | Primary table | Generated from local CRM snapshot |
| Evening daily report | Our System | Primary table | Collected through Telegram |
| Telegram message delivery state | Our System | Primary table | Managed by delivery queue/retry worker |
| Integration logs and retries | Our System | Primary table | Managed by integration layer |
| Analytics metrics | Our System | Derived tables/views or runtime queries | Derived from local normalized data |

## Critical Implications

- Bitrix24 webhook payloads cannot be treated as complete CRM records. The event gives the changed object ID, then sync must fetch the entity.
- Local analytics must tolerate sync lag. Dashboards should show `lastSyncedAt`.
- Write-back must be idempotent. Every outbound command needs a stable local command ID and remote result tracking.
- Raw payload storage is required during the first phases because Bitrix fields and custom fields are not fully known yet.
