-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "crmLeadId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "crmLeadId" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "crmLeadId" TEXT;

-- CreateIndex
CREATE INDEX "Client_crmLeadId_idx" ON "Client"("crmLeadId");

-- CreateIndex
CREATE INDEX "Project_crmLeadId_idx" ON "Project"("crmLeadId");

-- CreateIndex
CREATE INDEX "Task_crmLeadId_idx" ON "Task"("crmLeadId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_crmLeadId_fkey" FOREIGN KEY ("crmLeadId") REFERENCES "CrmLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_crmLeadId_fkey" FOREIGN KEY ("crmLeadId") REFERENCES "CrmLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_crmLeadId_fkey" FOREIGN KEY ("crmLeadId") REFERENCES "CrmLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
