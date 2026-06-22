import { ApiError } from "../../common/api-error.js";
import { env } from "../../config/env.js";

type TelegramResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

export class TelegramClient {
  constructor(private readonly token = env.telegramBotToken) {}

  isConfigured() {
    return Boolean(this.token);
  }

  async call<T>(method: string, payload: Record<string, unknown>): Promise<T> {
    if (!this.token) {
      throw new ApiError(503, "TELEGRAM_NOT_CONFIGURED", "TELEGRAM_BOT_TOKEN is not configured");
    }

    const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as TelegramResponse<T>;
    if (!response.ok || !data.ok) {
      throw new ApiError(response.status || 502, "TELEGRAM_REQUEST_FAILED", data.description ?? "Telegram request failed", {
        method
      });
    }

    return data.result as T;
  }

  sendMessage(chatId: string, text: string, replyMarkup?: Record<string, unknown>) {
    return this.call("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {})
    });
  }
}

export const telegramClient = new TelegramClient();
