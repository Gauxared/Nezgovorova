# Iteration 04 — Dashboard Analytics

## Goal

Реализовать `/dashboard` с расчетом показателей на backend и визуализацией на frontend.

## Scope

### Backend

Endpoint:

```text
GET /api/analytics/dashboard
```

Фильтры:

- periodId;
- dateFrom;
- dateTo;
- clientId;
- projectId;
- responsibleUserId;
- directionId.

Возвращать:

### KPI

- activeProjectsCount;
- completedProjectsCount;
- overdueTasksCount;
- completedTasksPercent;
- plannedIncome;
- actualIncome;
- expenses;
- profit.

### Charts

- projectsByStatus;
- tasksByStatus;
- financeDynamicsByPeriod;
- incomeExpenseComparison;
- topClientsByRevenue.

### Problem data

- overdueTasks;
- projectsNearDeadline;
- projectsWithNegativeProfit.

### Frontend

На `/dashboard`:

- KPI cards;
- фильтры;
- графики Recharts;
- таблица просроченных задач;
- таблица проблемных проектов;
- loading/error/empty states.

### Drill-down

- overdueTasksCount → `/tasks?overdue=true`;
- activeProjectsCount → `/projects?status=active`;
- completedProjectsCount → `/projects?status=completed`;
- финансовые KPI → `/finance` с фильтрами.

## Out of scope

Не делать:

- конструктор отчетов;
- экспорт;
- импорт;
- настройку dashboard пользователем.

## Definition of Done

- `/api/analytics/dashboard` работает;
- показатели рассчитываются на backend;
- frontend отображает KPI;
- есть минимум 3 графика;
- фильтры влияют на данные;
- есть списки просроченных задач и проблемных проектов;
- drill-down работает;
- empty/error states есть;
- расчетов нет в React-компонентах.

## Verification commands

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

## Manual check

1. открыть `/dashboard`;
2. проверить KPI;
3. изменить период;
4. проверить графики;
5. кликнуть по просроченным задачам.

## Notes for Codex

- Если данных мало, расширь seed.
- Не делай frontend-only фейковые показатели.

## Общий формат ответа Codex после реализации

Codex должен указать:

- что сделано;
- какие файлы созданы или изменены;
- какие команды проверки выполнены;
- какие пункты Definition of Done выполнены;
- какие ограничения или проблемы остались.
