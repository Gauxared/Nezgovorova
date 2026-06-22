# Tech Stack

## Monorepo

```text
/frontend
/backend
/docker-compose.yml
/README.md
/docs
```

## Frontend

- React;
- TypeScript;
- Vite;
- React Router;
- Recharts;
- Axios или Fetch API;
- CSS Modules / SCSS / обычный CSS;
- AuthProvider;
- ProtectedRoute.

## Backend

- Node.js;
- TypeScript;
- Express или NestJS;
- REST API;
- Prisma;
- PostgreSQL;
- Zod или class-validator;
- JWT;
- bcrypt.

## Database

- PostgreSQL;
- Prisma migrations;
- seed-данные.

## Правила архитектуры

- расчеты аналитики выполняются на backend;
- frontend отображает, фильтрует и визуализирует;
- права проверяются на backend;
- seed обязателен для демонстрации;
- mock-данные допустимы только временно.
