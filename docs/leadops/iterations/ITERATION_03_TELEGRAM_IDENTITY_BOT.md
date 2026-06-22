# Iteration 03 - Telegram Identity and Bot Skeleton

## Goal

Подключить Telegram bot и реализовать безопасную привязку внешнего сотрудника к Telegram chat.

## Scope

- Добавить env-переменные Telegram bot token и webhook secret.
- Добавить Telegram module на backend.
- Реализовать webhook endpoint.
- Реализовать команду `/start`.
- Реализовать одноразовый код привязки сотрудника.
- Сохранить `telegramUserId`, `chatId`, username и дату привязки.
- Добавить тестовую отправку сообщения сотруднику из admin endpoint.

## Out of scope

- Не делать утренние и вечерние сценарии.
- Не писать обратно в Bitrix24.
- Не добавлять другие мессенджеры.

## Definition of Done

- Telegram webhook принимает update.
- Сотрудник может привязать Telegram через код.
- Нельзя привязать один код повторно.
- Система умеет отправить тестовое сообщение.
- Все входящие Telegram update пишутся в `IntegrationEvent`.

## Verification

```bash
cd backend
npm run build
```

Ручная проверка:

- создать сотрудника;
- сгенерировать код привязки;
- отправить `/start <code>` боту;
- проверить `MessengerAccount`;
- отправить тестовое сообщение из backend.

