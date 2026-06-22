# API Contract

## Общие правила

- защищенные endpoints требуют JWT;
- права проверяются на backend;
- формат обмена — JSON;
- ошибки возвращаются единообразно.

## Error format

```json
{
  "message": "Описание ошибки",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Auth

- POST `/api/auth/login`
- GET `/api/auth/me`

## Users

- GET `/api/users`
- GET `/api/users/:id`
- POST `/api/users`
- PATCH `/api/users/:id`
- DELETE `/api/users/:id`

Доступ: `admin`.

## Clients

- GET `/api/clients`
- GET `/api/clients/:id`
- POST `/api/clients`
- PATCH `/api/clients/:id`
- DELETE `/api/clients/:id`

Фильтры: `search`, `status`, `source`.

## Projects

- GET `/api/projects`
- GET `/api/projects/:id`
- POST `/api/projects`
- PATCH `/api/projects/:id`
- DELETE `/api/projects/:id`

Фильтры: `clientId`, `statusId`, `responsibleUserId`, `directionId`, `dateFrom`, `dateTo`, `overdue`.

## Tasks

- GET `/api/tasks`
- GET `/api/tasks/:id`
- POST `/api/tasks`
- PATCH `/api/tasks/:id`
- DELETE `/api/tasks/:id`

Фильтры: `projectId`, `statusId`, `responsibleUserId`, `priority`, `overdue`.

## Financial values

- GET `/api/financial-values`
- GET `/api/financial-values/:id`
- POST `/api/financial-values`
- PATCH `/api/financial-values/:id`
- DELETE `/api/financial-values/:id`

Фильтры: `projectId`, `periodId`, `type`, `dateFrom`, `dateTo`.

## References

- GET `/api/references/statuses`
- GET `/api/references/directions`
- GET `/api/references/periods`

Также нужны CRUD endpoints для справочников.

## Analytics

### GET `/api/analytics/dashboard`

Фильтры: `periodId`, `dateFrom`, `dateTo`, `clientId`, `projectId`, `responsibleUserId`, `directionId`.

Возвращает:

- KPI: activeProjectsCount, completedProjectsCount, overdueTasksCount, completedTasksPercent, plannedIncome, actualIncome, expenses, profit;
- charts: projectsByStatus, tasksByStatus, financeDynamicsByPeriod, incomeExpenseComparison, topClientsByRevenue;
- problemData: overdueTasks, projectsNearDeadline, projectsWithNegativeProfit.

## Reports

- GET `/api/reports`
- POST `/api/reports`
- GET `/api/reports/:id`
- PATCH `/api/reports/:id`
- DELETE `/api/reports/:id`
- GET `/api/reports/:id/export?format=csv`
- GET `/api/reports/:id/export?format=xlsx`

## Import

- POST `/api/import/clients`
- POST `/api/import/projects`
- POST `/api/import/tasks`
- POST `/api/import/financial-values`

## Audit

- GET `/api/audit-logs`

Доступ: `admin`, `analyst`.
