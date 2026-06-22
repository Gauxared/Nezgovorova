import { Prisma } from "@prisma/client";
import { ApiError } from "../../common/api-error.js";
import { prisma } from "../../prisma/client.js";
import { telegramClient } from "./telegram.client.js";

type TelegramMessage = {
  message_id?: number;
  chat?: {
    id?: number | string;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  from?: {
    id?: number | string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  text?: string;
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
  callback_query?: {
    id?: string;
    data?: string;
    message?: TelegramMessage;
    from?: TelegramMessage["from"];
  };
};

function displayName(message: TelegramMessage) {
  return [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") || message.from?.username || "Telegram user";
}

export async function queueTelegramMessage(params: {
  chatId: string;
  text: string;
  messengerAccountId?: string;
  payload?: Prisma.InputJsonValue;
}) {
  return prisma.messageDelivery.create({
    data: {
      provider: "telegram",
      messengerAccountId: params.messengerAccountId,
      recipientChatId: params.chatId,
      text: params.text,
      payload: params.payload ?? Prisma.JsonNull,
      status: "queued",
      nextAttemptAt: new Date()
    }
  });
}

export async function sendQueuedTelegramMessages(limit = 20) {
  const messages = await prisma.messageDelivery.findMany({
    where: {
      provider: "telegram",
      status: "queued",
      nextAttemptAt: { lte: new Date() }
    },
    orderBy: { createdAt: "asc" },
    take: limit
  });

  const results = [];
  for (const message of messages) {
    try {
      if (!message.recipientChatId) {
        throw new ApiError(400, "TELEGRAM_CHAT_ID_MISSING", "Message delivery has no recipient chat id");
      }

      await prisma.messageDelivery.update({
        where: { id: message.id },
        data: { status: "sent", attempts: { increment: 1 } }
      });

      const response = await telegramClient.sendMessage(message.recipientChatId, message.text);
      const sent = await prisma.messageDelivery.update({
        where: { id: message.id },
        data: {
          status: "succeeded",
          sentAt: new Date(),
          externalMessageId: typeof response === "object" && response && "message_id" in response ? String(response.message_id) : undefined
        }
      });
      results.push(sent);
    } catch (error) {
      const failed = await prisma.messageDelivery.update({
        where: { id: message.id },
        data: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown Telegram delivery error"
        }
      });
      results.push(failed);
    }
  }

  return results;
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const message = update.message ?? update.callback_query?.message;
  const chatId = message?.chat?.id ? String(message.chat.id) : undefined;
  const text = update.message?.text ?? update.callback_query?.data ?? "";

  await prisma.integrationEvent.create({
    data: {
      provider: "telegram",
      direction: "inbound",
      eventType: update.callback_query ? "callback_query" : "message",
      externalId: update.update_id ? String(update.update_id) : undefined,
      idempotencyKey: update.update_id ? `telegram:update:${update.update_id}` : undefined,
      status: "received",
      payload: update as Prisma.InputJsonObject
    }
  });

  if (!chatId || !message) {
    return { ok: true, ignored: true };
  }

  if (text.startsWith("/start")) {
    const token = text.replace("/start", "").trim();
    const worker = token
      ? await prisma.externalWorker.findFirst({
          where: { id: token, status: "active" }
        })
      : null;

    if (!worker) {
      await queueTelegramMessage({
        chatId,
        text: "Telegram account received. Ask the manager for a personal link token before binding."
      });
      return { ok: true, action: "start_without_worker" };
    }

    const account = await prisma.messengerAccount.upsert({
      where: { provider_externalChatId: { provider: "telegram", externalChatId: chatId } },
      create: {
        workerId: worker.id,
        provider: "telegram",
        externalChatId: chatId,
        externalUserId: message.from?.id ? String(message.from.id) : undefined,
        username: message.from?.username,
        displayName: displayName(message),
        isVerified: true,
        verifiedAt: new Date(),
        lastInboundAt: new Date(),
        rawPayload: update as Prisma.InputJsonObject
      },
      update: {
        workerId: worker.id,
        externalUserId: message.from?.id ? String(message.from.id) : undefined,
        username: message.from?.username,
        displayName: displayName(message),
        isVerified: true,
        verifiedAt: new Date(),
        lastInboundAt: new Date(),
        rawPayload: update as Prisma.InputJsonObject
      }
    });

    await queueTelegramMessage({
      chatId,
      messengerAccountId: account.id,
      text: `Account linked to ${worker.fullName}.`
    });

    return { ok: true, action: "linked", workerId: worker.id };
  }

  await prisma.botConversationState.upsert({
    where: { provider_externalChatId: { provider: "telegram", externalChatId: chatId } },
    create: {
      provider: "telegram",
      externalChatId: chatId,
      state: "free_text_received",
      context: { text } as Prisma.InputJsonObject
    },
    update: {
      state: "free_text_received",
      context: { text } as Prisma.InputJsonObject
    }
  });

  return { ok: true, action: "stored_state" };
}
