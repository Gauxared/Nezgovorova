import { Router } from "express";
import { ApiError } from "../../common/api-error.js";
import { env } from "../../config/env.js";
import { prisma } from "../../prisma/client.js";
import { requireAuth, requireRoles } from "../auth/auth.middleware.js";
import { telegramClient } from "./telegram.client.js";
import { handleTelegramUpdate, queueTelegramMessage, sendQueuedTelegramMessages } from "./telegram.service.js";

export const telegramRouter = Router();

telegramRouter.get("/status", requireAuth, async (_request, response) => {
  const queued = await prisma.messageDelivery.count({ where: { provider: "telegram", status: "queued" } });
  const failed = await prisma.messageDelivery.count({ where: { provider: "telegram", status: "failed" } });

  response.json({
    configured: telegramClient.isConfigured(),
    queued,
    failed
  });
});

telegramRouter.post("/messages", requireAuth, requireRoles(["admin", "analyst"]), async (request, response, next) => {
  try {
    const chatId = String(request.body?.chatId ?? "");
    const text = String(request.body?.text ?? "");
    if (!chatId || !text) {
      throw new ApiError(400, "VALIDATION_ERROR", "chatId and text are required");
    }

    const delivery = await queueTelegramMessage({ chatId, text });
    response.status(201).json(delivery);
  } catch (error) {
    next(error);
  }
});

telegramRouter.post("/deliver", requireAuth, requireRoles(["admin", "analyst"]), async (_request, response, next) => {
  try {
    const result = await sendQueuedTelegramMessages();
    response.json({ sent: result.length, result });
  } catch (error) {
    next(error);
  }
});

telegramRouter.post("/webhook", async (request, response, next) => {
  try {
    const secret = request.header("x-telegram-bot-api-secret-token");
    if (env.telegramWebhookSecret && secret !== env.telegramWebhookSecret) {
      throw new ApiError(401, "INVALID_TELEGRAM_SECRET", "Invalid Telegram webhook secret");
    }

    const result = await handleTelegramUpdate(request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
});
