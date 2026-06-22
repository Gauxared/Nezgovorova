# Database Model

## Основные таблицы

- Role;
- User;
- Client;
- Direction;
- Status;
- Project;
- Task;
- ReportPeriod;
- FinancialValue;
- Report;
- AuditLog;
- ImportLog, опционально.

## Role

Поля: `id`, `code`, `name`, `description`, `createdAt`, `updatedAt`.

Роли: `admin`, `director`, `project_manager`, `client_manager`, `finance`, `analyst`.

## User

Поля: `id`, `fullName`, `email`, `passwordHash`, `roleId`, `departmentId`, `isActive`, `createdAt`, `updatedAt`.

## Client

Поля: `id`, `name`, `contactPerson`, `phone`, `email`, `source`, `status`, `createdAt`, `updatedAt`.

Связь: один клиент имеет много проектов.

## Direction

Поля: `id`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`.

## Status

Поля: `id`, `entityType`, `code`, `name`, `color`, `isFinal`, `sortOrder`, `createdAt`, `updatedAt`.

`entityType`: `project`, `task`, `client`.

## Project

Поля: `id`, `name`, `clientId`, `responsibleUserId`, `directionId`, `statusId`, `startDate`, `plannedEndDate`, `actualEndDate`, `budget`, `description`, `createdAt`, `updatedAt`.

Связи: Client, User, Direction, Status, Task[], FinancialValue[].

## Task

Поля: `id`, `projectId`, `title`, `description`, `responsibleUserId`, `statusId`, `priority`, `plannedEndDate`, `actualEndDate`, `laborHours`, `createdAt`, `updatedAt`.

## ReportPeriod

Поля: `id`, `name`, `dateFrom`, `dateTo`, `isClosed`, `createdAt`, `updatedAt`.

## FinancialValue

Поля: `id`, `projectId`, `periodId`, `type`, `amount`, `comment`, `date`, `createdById`, `createdAt`, `updatedAt`.

`type`: `income`, `expense`, `planned_income`, `planned_expense`.

## Report

Поля: `id`, `title`, `description`, `type`, `filters`, `createdById`, `createdAt`, `updatedAt`.

Типы: `projects`, `tasks`, `finance`, `clients`, `summary`.

## AuditLog

Поля: `id`, `userId`, `action`, `entityType`, `entityId`, `oldValue`, `newValue`, `createdAt`.

Действия: `create`, `update`, `delete`, `login`, `import`, `export`.

## Правила

- справочники лучше деактивировать через `isActive`;
- финансовые суммы хранить как decimal;
- отчеты хранят настройки, а данные пересчитываются при открытии;
- важные изменения пишутся в AuditLog.
