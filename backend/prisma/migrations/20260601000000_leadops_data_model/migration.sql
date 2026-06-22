-- CreateEnum
CREATE TYPE "CrmLeadLifecycleStatus" AS ENUM ('active', 'converted', 'failed', 'deleted');

-- CreateEnum
CREATE TYPE "CrmActivityStatus" AS ENUM ('pending', 'completed', 'canceled', 'unknown');

-- CreateEnum
CREATE TYPE "MessengerProvider" AS ENUM ('telegram');

-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('active', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "DailyPlanStatus" AS ENUM ('draft', 'sent', 'completed', 'missed');

-- CreateEnum
CREATE TYPE "DailyReportStatus" AS ENUM ('pending', 'submitted', 'missed');

-- CreateEnum
CREATE TYPE "ReportItemStatus" AS ENUM ('planned', 'in_progress', 'done', 'blocked', 'postponed');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('bitrix24', 'telegram');

-- CreateEnum
CREATE TYPE "SyncJobStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "IntegrationEventDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "IntegrationEventStatus" AS ENUM ('received', 'processed', 'failed', 'ignored');

-- CreateEnum
CREATE TYPE "OutboundCommandType" AS ENUM ('bitrix_add_timeline_comment', 'bitrix_add_activity', 'bitrix_complete_activity', 'bitrix_update_lead_stage', 'telegram_send_message');

-- CreateEnum
CREATE TYPE "OutboundCommandStatus" AS ENUM ('queued', 'sent', 'succeeded', 'failed', 'canceled');

-- CreateTable
CREATE TABLE "CrmStage" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL DEFAULT 'STATUS',
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "semantic" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "CrmStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmLead" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stageExternalId" TEXT,
    "lifecycleStatus" "CrmLeadLifecycleStatus" NOT NULL DEFAULT 'active',
    "amount" DECIMAL(14,2),
    "currency" TEXT,
    "source" TEXT,
    "assignedByExternalId" TEXT,
    "assignedByName" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "comments" TEXT,
    "customerPath" TEXT,
    "lossReason" TEXT,
    "bitrixCreatedAt" TIMESTAMP(3),
    "bitrixUpdatedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmActivity" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "leadExternalId" TEXT,
    "ownerTypeId" INTEGER,
    "typeId" INTEGER,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMP(3),
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "status" "CrmActivityStatus" NOT NULL DEFAULT 'unknown',
    "bitrixStatus" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "responsibleExternalId" TEXT,
    "responsibleName" TEXT,
    "bitrixCreatedAt" TIMESTAMP(3),
    "bitrixUpdatedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalWorker" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "bitrixUserExternalId" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Novosibirsk',
    "workdayStart" TEXT NOT NULL DEFAULT '09:00',
    "workdayEnd" TEXT NOT NULL DEFAULT '18:00',
    "status" "WorkerStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessengerAccount" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "provider" "MessengerProvider" NOT NULL DEFAULT 'telegram',
    "externalUserId" TEXT,
    "externalChatId" TEXT,
    "username" TEXT,
    "displayName" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "lastInboundAt" TIMESTAMP(3),
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessengerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerDailyPlan" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "status" "DailyPlanStatus" NOT NULL DEFAULT 'draft',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerDailyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerDailyPlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "leadId" TEXT,
    "activityId" TEXT,
    "status" "ReportItemStatus" NOT NULL DEFAULT 'planned',
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerDailyPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerDailyReport" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "planId" TEXT,
    "workDate" TIMESTAMP(3) NOT NULL,
    "status" "DailyReportStatus" NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3),
    "summary" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerDailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerReportItem" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "planItemId" TEXT,
    "leadId" TEXT,
    "activityId" TEXT,
    "status" "ReportItemStatus" NOT NULL,
    "comment" TEXT,
    "needsManager" BOOLEAN NOT NULL DEFAULT false,
    "nextActionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerReportItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageDelivery" (
    "id" TEXT NOT NULL,
    "messengerAccountId" TEXT,
    "provider" "MessengerProvider" NOT NULL DEFAULT 'telegram',
    "externalMessageId" TEXT,
    "recipientChatId" TEXT,
    "text" TEXT NOT NULL,
    "payload" JSONB,
    "status" "OutboundCommandStatus" NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotConversationState" (
    "id" TEXT NOT NULL,
    "provider" "MessengerProvider" NOT NULL DEFAULT 'telegram',
    "externalChatId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "context" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotConversationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" "SyncJobStatus" NOT NULL DEFAULT 'queued',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "requestedById" TEXT,
    "cursor" TEXT,
    "stats" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationEvent" (
    "id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "direction" "IntegrationEventDirection" NOT NULL,
    "eventType" TEXT NOT NULL,
    "externalId" TEXT,
    "idempotencyKey" TEXT,
    "status" "IntegrationEventStatus" NOT NULL DEFAULT 'received',
    "payload" JSONB,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundCommand" (
    "id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "commandType" "OutboundCommandType" NOT NULL,
    "status" "OutboundCommandStatus" NOT NULL DEFAULT 'queued',
    "idempotencyKey" TEXT NOT NULL,
    "leadId" TEXT,
    "activityId" TEXT,
    "payload" JSONB NOT NULL,
    "response" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboundCommand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrmStage_externalId_key" ON "CrmStage"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "CrmLead_externalId_key" ON "CrmLead"("externalId");

-- CreateIndex
CREATE INDEX "CrmLead_stageExternalId_idx" ON "CrmLead"("stageExternalId");

-- CreateIndex
CREATE INDEX "CrmLead_assignedByExternalId_idx" ON "CrmLead"("assignedByExternalId");

-- CreateIndex
CREATE INDEX "CrmLead_bitrixUpdatedAt_idx" ON "CrmLead"("bitrixUpdatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrmActivity_externalId_key" ON "CrmActivity"("externalId");

-- CreateIndex
CREATE INDEX "CrmActivity_leadExternalId_idx" ON "CrmActivity"("leadExternalId");

-- CreateIndex
CREATE INDEX "CrmActivity_deadline_idx" ON "CrmActivity"("deadline");

-- CreateIndex
CREATE INDEX "CrmActivity_responsibleExternalId_idx" ON "CrmActivity"("responsibleExternalId");

-- CreateIndex
CREATE INDEX "ExternalWorker_bitrixUserExternalId_idx" ON "ExternalWorker"("bitrixUserExternalId");

-- CreateIndex
CREATE INDEX "MessengerAccount_workerId_idx" ON "MessengerAccount"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "MessengerAccount_provider_externalChatId_key" ON "MessengerAccount"("provider", "externalChatId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerDailyPlan_workerId_workDate_key" ON "WorkerDailyPlan"("workerId", "workDate");

-- CreateIndex
CREATE INDEX "WorkerDailyPlanItem_planId_idx" ON "WorkerDailyPlanItem"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerDailyReport_workerId_workDate_key" ON "WorkerDailyReport"("workerId", "workDate");

-- CreateIndex
CREATE INDEX "WorkerReportItem_reportId_idx" ON "WorkerReportItem"("reportId");

-- CreateIndex
CREATE INDEX "MessageDelivery_status_nextAttemptAt_idx" ON "MessageDelivery"("status", "nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "BotConversationState_provider_externalChatId_key" ON "BotConversationState"("provider", "externalChatId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_provider_name_key" ON "IntegrationConnection"("provider", "name");

-- CreateIndex
CREATE INDEX "SyncJob_provider_jobType_status_idx" ON "SyncJob"("provider", "jobType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationEvent_idempotencyKey_key" ON "IntegrationEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "IntegrationEvent_provider_eventType_idx" ON "IntegrationEvent"("provider", "eventType");

-- CreateIndex
CREATE INDEX "IntegrationEvent_status_createdAt_idx" ON "IntegrationEvent"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OutboundCommand_idempotencyKey_key" ON "OutboundCommand"("idempotencyKey");

-- CreateIndex
CREATE INDEX "OutboundCommand_provider_status_nextAttemptAt_idx" ON "OutboundCommand"("provider", "status", "nextAttemptAt");

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_stageExternalId_fkey" FOREIGN KEY ("stageExternalId") REFERENCES "CrmStage"("externalId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_leadExternalId_fkey" FOREIGN KEY ("leadExternalId") REFERENCES "CrmLead"("externalId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalWorker" ADD CONSTRAINT "ExternalWorker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessengerAccount" ADD CONSTRAINT "MessengerAccount_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "ExternalWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerDailyPlan" ADD CONSTRAINT "WorkerDailyPlan_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "ExternalWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerDailyPlanItem" ADD CONSTRAINT "WorkerDailyPlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkerDailyPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerDailyPlanItem" ADD CONSTRAINT "WorkerDailyPlanItem_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerDailyPlanItem" ADD CONSTRAINT "WorkerDailyPlanItem_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "CrmActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerDailyReport" ADD CONSTRAINT "WorkerDailyReport_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "ExternalWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerDailyReport" ADD CONSTRAINT "WorkerDailyReport_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkerDailyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerReportItem" ADD CONSTRAINT "WorkerReportItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "WorkerDailyReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerReportItem" ADD CONSTRAINT "WorkerReportItem_planItemId_fkey" FOREIGN KEY ("planItemId") REFERENCES "WorkerDailyPlanItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerReportItem" ADD CONSTRAINT "WorkerReportItem_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerReportItem" ADD CONSTRAINT "WorkerReportItem_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "CrmActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDelivery" ADD CONSTRAINT "MessageDelivery_messengerAccountId_fkey" FOREIGN KEY ("messengerAccountId") REFERENCES "MessengerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundCommand" ADD CONSTRAINT "OutboundCommand_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundCommand" ADD CONSTRAINT "OutboundCommand_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "CrmActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
