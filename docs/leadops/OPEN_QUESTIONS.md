# LeadOps Open Questions

## P1 - Must Answer Before Iteration 01/02

| Question | Owner | Why it blocks |
| --- | --- | --- |
| Which Bitrix24 portal URL and integration auth mode will be used: incoming webhook, local app OAuth, or both? | Bitrix owner | Determines token handling, event subscription and available scopes |
| Which users are "external workers" and how do they map to Bitrix24 responsible users? | Business owner | Required for assignments and daily plans |
| Are external workers allowed to see phone/email/contact data in Telegram? | Business owner | Required for PII policy and message templates |
| Which Bitrix24 fields are mandatory for the first lead sync? | Business owner + Bitrix owner | Determines Prisma schema and sync mapping |
| Can Telegram actions write comments/activities back to Bitrix24 in MVP? | Business owner | Determines Iteration 05 scope and approval rules |
| What local timezone and workday schedule should be used for morning/evening messages? | Business owner | Required for scheduler and due/overdue logic |
| Should lead stage changes be allowed from Telegram? | Business owner | High-risk write-back decision |

## P2 - Should Answer During Iteration 01/02

| Question | Owner | Why it matters |
| --- | --- | --- |
| Does the portal use custom lead fields (`UF_*`) for customer path, loss reason or worker-specific data? | Bitrix owner | Affects raw payload and normalized columns |
| Are leads converted to deals, and should converted deals remain in analytics? | Business owner | Affects lifecycle and dashboard definitions |
| What counts as a successful day for an external worker? | Business owner | Defines metrics and report evaluation |
| Should the system handle weekends/holidays? | Business owner | Affects scheduler and SLA metrics |
| Who receives alerts when a worker reports a blocker? | Business owner | Required for notification routing |
| How long should raw Bitrix/Telegram payloads be retained? | Technical owner | Affects storage and privacy policy |

## P3 - Can Defer

| Question | Owner | Why it can wait |
| --- | --- | --- |
| Which messenger comes after Telegram? | Business owner | Keep data model extensible, implementation later |
| Is a manager mobile UI needed, or is Telegram enough initially? | Business owner | Frontend scope after MVP |
| Should analytics export to CSV/XLSX be supported? | Business owner | Existing app has reports/export patterns |
| Should AI summarization classify free-text worker comments? | Product owner | Useful later, not required for MVP |
