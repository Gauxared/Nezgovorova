# Iteration 02 — Authentication and Roles

## Goal

Реализовать авторизацию и ролевую модель доступа.

После завершения пользователь должен входить в систему, получать JWT, видеть свои данные, а backend должен ограничивать доступ к endpoints по ролям.

## Scope

### Backend

- login по email/password;
- bcrypt для паролей;
- JWT access token;
- middleware проверки авторизации;
- middleware проверки роли;
- `POST /api/auth/login`;
- `GET /api/auth/me`;
- защита API;
- обработка ошибок авторизации.

### Roles

- admin;
- director;
- project_manager;
- client_manager;
- finance;
- analyst.

### Frontend

- страница `/login`;
- форма входа;
- сохранение токена;
- AuthProvider;
- ProtectedRoute;
- logout;
- отображение имени и роли;
- скрытие недоступных пунктов меню.

### Permissions

- admin — полный доступ;
- director — dashboard и отчеты;
- project_manager — проекты и задачи;
- client_manager — клиенты;
- finance — финансы;
- analyst — аналитика, отчеты, журнал;
- неавторизованный пользователь видит только `/login`.

## Out of scope

Не делать:

- публичную регистрацию;
- восстановление пароля;
- refresh tokens, если это сильно усложняет;
- детальные права на уровне отдельных строк;
- финальный UI.

## Definition of Done

- вход под `admin@example.com / admin12345` работает;
- после входа открывается `/dashboard`;
- токен используется в API-запросах;
- `GET /api/auth/me` возвращает текущего пользователя;
- защищенные маршруты недоступны без входа;
- backend проверяет JWT;
- backend проверяет роли;
- frontend скрывает недоступные пункты меню;
- logout работает;
- ошибки входа отображаются понятно.

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

1. открыть `/login`;
2. войти под admin;
3. обновить страницу;
4. выйти;
5. проверить, что защищенные страницы недоступны.

## Notes for Codex

- Права нельзя проверять только на frontend.
- Пароли нельзя хранить открытым текстом.

## Общий формат ответа Codex после реализации

Codex должен указать:

- что сделано;
- какие файлы созданы или изменены;
- какие команды проверки выполнены;
- какие пункты Definition of Done выполнены;
- какие ограничения или проблемы остались.
