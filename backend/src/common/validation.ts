import { ApiError } from "./api-error.js";

export function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, "VALIDATION_ERROR", `Поле ${field} обязательно`);
  }

  return value.trim();
}

export function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function optionalBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

export function optionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Ожидалось числовое значение");
  }

  return parsed;
}

export function optionalDate(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, "VALIDATION_ERROR", "Некорректная дата");
  }

  return parsed;
}

export function requiredDate(value: unknown, field: string) {
  const parsed = optionalDate(value);
  if (!parsed) {
    throw new ApiError(400, "VALIDATION_ERROR", `Поле ${field} обязательно`);
  }

  return parsed;
}
