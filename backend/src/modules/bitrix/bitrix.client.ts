import { ApiError } from "../../common/api-error.js";
import { env } from "../../config/env.js";

type BitrixResponse<T> = {
  result?: T;
  error?: string;
  error_description?: string;
  total?: number;
  next?: number;
};

export class BitrixClient {
  constructor(private readonly webhookUrl = env.bitrixWebhookUrl) {}

  isConfigured() {
    return Boolean(this.webhookUrl);
  }

  async call<T>(method: string, params: Record<string, unknown> = {}): Promise<BitrixResponse<T>> {
    if (!this.webhookUrl) {
      throw new ApiError(503, "BITRIX_NOT_CONFIGURED", "BITRIX_WEBHOOK_URL is not configured");
    }

    const baseUrl = this.webhookUrl.endsWith("/") ? this.webhookUrl : `${this.webhookUrl}/`;
    const response = await fetch(`${baseUrl}${method}.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    });

    const data = (await response.json()) as BitrixResponse<T>;
    if (!response.ok || data.error) {
      throw new ApiError(response.status || 502, "BITRIX_REQUEST_FAILED", data.error_description ?? data.error ?? "Bitrix request failed", {
        method,
        status: response.status
      });
    }

    return data;
  }
}

export const bitrixClient = new BitrixClient();
