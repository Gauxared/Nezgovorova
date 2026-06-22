import type { Prisma } from "@prisma/client";

function asString(value: unknown) {
  return value === null || value === undefined ? undefined : String(value);
}

function asDate(value: unknown) {
  const text = asString(value);
  if (!text) {
    return undefined;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function asDecimalInput(value: unknown): Prisma.Decimal | string | number | undefined {
  const text = asString(value);
  if (!text) {
    return undefined;
  }

  return text;
}

function firstMultifieldValue(raw: Record<string, unknown>, key: string) {
  const value = raw[key];
  if (!Array.isArray(value)) {
    return undefined;
  }

  const first = value.find((item) => item && typeof item === "object") as Record<string, unknown> | undefined;
  return first ? asString(first.VALUE) : undefined;
}

export function mapBitrixStage(raw: Record<string, unknown>) {
  const extra = raw.EXTRA && typeof raw.EXTRA === "object" ? (raw.EXTRA as Record<string, unknown>) : {};

  return {
    externalId: asString(raw.STATUS_ID) ?? asString(raw.ID) ?? "unknown",
    entityId: asString(raw.ENTITY_ID) ?? "STATUS",
    name: asString(raw.NAME) ?? asString(raw.STATUS_ID) ?? "Unnamed stage",
    sortOrder: Number(asString(raw.SORT) ?? 0),
    color: asString(raw.COLOR) ?? asString(extra.COLOR),
    semantic: asString(extra.SEMANTICS),
    rawPayload: raw as Prisma.InputJsonObject,
    lastSyncedAt: new Date()
  };
}

export function mapBitrixLead(raw: Record<string, unknown>) {
  return {
    externalId: asString(raw.ID) ?? "unknown",
    title: asString(raw.TITLE) ?? `Lead ${asString(raw.ID) ?? "unknown"}`,
    stageExternalId: asString(raw.STATUS_ID),
    amount: asDecimalInput(raw.OPPORTUNITY),
    currency: asString(raw.CURRENCY_ID),
    source: asString(raw.SOURCE_ID) ?? asString(raw.SOURCE_DESCRIPTION),
    assignedByExternalId: asString(raw.ASSIGNED_BY_ID),
    contactName: asString(raw.NAME) ?? asString(raw.FULL_NAME),
    contactPhone: firstMultifieldValue(raw, "PHONE"),
    contactEmail: firstMultifieldValue(raw, "EMAIL"),
    comments: asString(raw.COMMENTS),
    bitrixCreatedAt: asDate(raw.DATE_CREATE),
    bitrixUpdatedAt: asDate(raw.DATE_MODIFY),
    lastSyncedAt: new Date(),
    rawPayload: raw as Prisma.InputJsonObject
  };
}

export function mapBitrixActivity(raw: Record<string, unknown>) {
  const completed = asString(raw.COMPLETED) === "Y";

  return {
    externalId: asString(raw.ID) ?? "unknown",
    leadExternalId: asString(raw.OWNER_ID),
    ownerTypeId: Number(asString(raw.OWNER_TYPE_ID) ?? 0) || undefined,
    typeId: Number(asString(raw.TYPE_ID) ?? 0) || undefined,
    subject: asString(raw.SUBJECT) ?? `Activity ${asString(raw.ID) ?? "unknown"}`,
    description: asString(raw.DESCRIPTION),
    deadline: asDate(raw.DEADLINE),
    startTime: asDate(raw.START_TIME),
    endTime: asDate(raw.END_TIME),
    completed,
    status: completed ? "completed" : "pending",
    bitrixStatus: asString(raw.STATUS),
    responsibleExternalId: asString(raw.RESPONSIBLE_ID),
    bitrixCreatedAt: asDate(raw.CREATED),
    bitrixUpdatedAt: asDate(raw.LAST_UPDATED),
    lastSyncedAt: new Date(),
    rawPayload: raw as Prisma.InputJsonObject
  } satisfies Prisma.CrmActivityUncheckedCreateInput;
}
