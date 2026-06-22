# Iteration 03 — CRUD Modules

## Goal

Реализовать CRUD-модули для основных данных: клиенты, проекты, задачи, финансовые показатели и справочники.

## Scope

### Backend modules

REST API для:

- Clients;
- Projects;
- Tasks;
- FinancialValues;
- Statuses;
- Directions;
- ReportPeriods.

Для каждого модуля:

- GET list;
- GET by id;
- POST create;
- PATCH update;
- DELETE remove или deactivate;
- валидация;
- проверка прав;
- audit log для create/update/delete.

### Frontend pages

- `/clients`;
- `/projects`;
- `/tasks`;
- `/finance`;
- `/admin/references`.

Для каждого списка:

- таблица;
- поиск;
- фильтры;
- кнопка создания;
- форма создания;
- форма редактирования;
- подтверждение удаления;
- loading/error/empty states.

### Relationships

- Project связан с Client;
- Project связан с ответственным User;
- Project связан с Direction;
- Project связан со Status;
- Task связан с Project;
- Task связан с ответственным User;
- Task связан со Status;
- FinancialValue связан с Project;
- FinancialValue связан с ReportPeriod.

## Out of scope

Не делать:

- сложный dashboard;
- импорт;
- экспорт;
- детальные графики;
- массовые операции.

## Definition of Done

- можно создать/изменить/удалить клиента;
- можно создать/изменить/удалить проект;
- можно создать/изменить/удалить задачу;
- можно создать/изменить/удалить финансовую запись;
- можно управлять статусами, направлениями и периодами;
- формы используют select со справочниками;
- таблицы показывают связанные названия, а не только id;
- ошибки API отображаются;
- create/update/delete попадают в audit log;
- доступ ограничен ролями;
- данные сохраняются после перезапуска.

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

1. войти как admin;
2. создать клиента;
3. создать проект для клиента;
4. создать задачу;
5. создать финансовую запись;
6. обновить страницу и проверить сохранение.

## Notes for Codex

- Используй переиспользуемые компоненты форм и таблиц.
- Для справочников желательно использовать `isActive`.

## Общий формат ответа Codex после реализации

Codex должен указать:

- что сделано;
- какие файлы созданы или изменены;
- какие команды проверки выполнены;
- какие пункты Definition of Done выполнены;
- какие ограничения или проблемы остались.
