import { demoApiRequest, isDemoMode } from "./demoApi";

export const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:4009/api";
export const IS_DEMO_MODE = isDemoMode;
export const TOKEN_STORAGE_KEY = "analytics_access_token";

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  if (IS_DEMO_MODE) {
    return demoApiRequest<T>(path, options);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Ошибка API");
  }

  return data;
}
