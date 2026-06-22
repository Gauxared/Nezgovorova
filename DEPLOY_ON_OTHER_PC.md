# Развертывание на другом ПК

## Что нужно установить

- Node.js 22 или новее
- Docker Desktop
- Git не обязателен, если проект передается архивом

## Запуск

Откройте PowerShell в папке проекта.

1. Запустить PostgreSQL:

```powershell
docker compose up -d
```

2. Подготовить backend:

```powershell
cd backend
copy .env.example .env
npm ci
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

Backend будет доступен на `http://localhost:4000`.

3. В отдельном окне PowerShell запустить frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Frontend будет доступен на `http://localhost:5173`.

## Демо-пользователи

```text
admin@example.com / admin12345
director@example.com / director12345
pm@example.com / pm12345
analyst@example.com / analyst12345
finance@example.com / finance12345
```

## Проверка

```powershell
cd backend
npm run build
```

```powershell
cd frontend
npm run build
```

Если PowerShell блокирует `npm.ps1`, используйте `npm.cmd`, например:

```powershell
npm.cmd ci
npm.cmd run dev
```
