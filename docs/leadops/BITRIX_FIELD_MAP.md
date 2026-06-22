# Bitrix24 Field Map

## Discovery Status

This is an Iteration 00 draft based on screenshots and Bitrix24 REST documentation available through MCP. Final field codes must be confirmed against the real portal using `crm.lead.fields`, `crm.activity.fields` and live sample payloads.

## Lead Fields

| Business field | Expected Bitrix field/code | Required for MVP | Notes |
| --- | --- | --- | --- |
| Lead external ID | `ID` | Yes | Primary sync key |
| Title | `TITLE` | Yes | Display in list, plan and analytics |
| Stage | `STATUS_ID` | Yes | Resolve name/color/semantic through `crm.status.list` |
| Stage name | Derived from status dictionary | Yes | Cache locally |
| Stage semantic | `EXTRA.SEMANTICS` from status dictionary | Yes | `process`, `success`, `failure` |
| Amount | `OPPORTUNITY` | No | Visible in card, useful for analytics later |
| Currency | `CURRENCY_ID` | No | Pair with amount |
| Source | `SOURCE_ID` / source fields | Yes | Exact fields must be confirmed |
| Responsible | `ASSIGNED_BY_ID` | Yes | Needs user lookup in later iteration |
| Created at | `DATE_CREATE` | Yes | Used for age metrics |
| Updated at | `DATE_MODIFY` | Yes | Used for incremental sync |
| Contact name | Lead fields or linked contact | Yes | Confirm portal behavior |
| Phone | Lead multifield or linked contact | Yes | Confirm via field metadata |
| Email | Lead multifield or linked contact | Yes | Confirm via field metadata |
| Comment | `COMMENTS` or timeline comment | No | Depends on portal setup |
| UTM tags | `UTM_*` fields | No | Useful for source analytics |
| Loss reason | Status/field dependent | No | Visible in list screenshot |
| Customer path | Custom/user field likely | No | Must be confirmed from `UF_*` fields |

## Stage Dictionary

Use `crm.status.list` with:

```json
{
  "filter": {
    "ENTITY_ID": "STATUS"
  }
}
```

Relevant returned fields:

- `STATUS_ID`
- `NAME`
- `SORT`
- `COLOR`
- `EXTRA.SEMANTICS`

## Activity Fields

`crm.activity.fields` confirms these relevant fields:

| Business field | Bitrix field/code | Required for MVP | Notes |
| --- | --- | --- | --- |
| Activity ID | `ID` | Yes | Primary sync key |
| Owner lead ID | `OWNER_ID` | Yes | Combine with `OWNER_TYPE_ID` |
| Owner type | `OWNER_TYPE_ID` | Yes | Lead owner type must be confirmed in payload |
| Type | `TYPE_ID` | Yes | Call/email/meeting/task/etc. |
| Subject | `SUBJECT` | Yes | Display in Telegram |
| Deadline | `DEADLINE` | Yes | Morning plan and overdue logic |
| Start/end time | `START_TIME`, `END_TIME` | No | Useful for meetings |
| Completed flag | `COMPLETED` | Yes | Work status |
| Status | `STATUS` | Yes | Resolve through `crm.enum.activitystatus` later |
| Responsible | `RESPONSIBLE_ID` | Yes | Worker assignment mapping |
| Description | `DESCRIPTION` | No | Long text, may contain PII |
| Communications | `COMMUNICATIONS` | No | Phones/emails for calls and mail |
| Created/updated | `CREATED`, `LAST_UPDATED` | Yes | Incremental sync |

## Events

| Event | Payload fact | Required handler behavior |
| --- | --- | --- |
| `ONCRMLEADADD` | Sends `data.FIELDS.ID` | Fetch lead by ID |
| `ONCRMLEADUPDATE` | Sends `data.FIELDS.ID` | Fetch lead by ID and upsert |
| `ONCRMLEADDELETE` | Sends deleted lead data/ID | Mark local lead deleted/archived |
| `onCrmActivityAdd` | Sends `data.FIELDS.ID` | Fetch activity by ID |
| `onCrmActivityUpdate` | Sends `data.FIELDS.ID` | Fetch activity by ID and upsert |

## Methods To Confirm In Iteration 02

- `crm.lead.list`
- `crm.lead.get`
- `crm.lead.fields`
- `crm.status.list`
- `crm.activity.list`
- `crm.activity.fields`
- `crm.lead.contact.items.get`
- `crm.contact.list`
- `crm.enum.activitystatus`
- `event.bind`
