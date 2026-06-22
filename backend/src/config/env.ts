import "dotenv/config";

const port = Number(process.env.PORT ?? 4001);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

export const env = {
  bitrixWebhookUrl: process.env.BITRIX_WEBHOOK_URL,
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5175",
  jwtSecret: process.env.JWT_SECRET,
  port: Number.isNaN(port) ? 4001 : port,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET
};
