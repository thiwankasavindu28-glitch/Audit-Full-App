-- CreateIndex
CREATE INDEX "Audit_status_idx" ON "Audit"("status");

-- CreateIndex
CREATE INDEX "Audit_auditorId_idx" ON "Audit"("auditorId");

-- CreateIndex
CREATE INDEX "Audit_auditedUserId_idx" ON "Audit"("auditedUserId");

-- CreateIndex
CREATE INDEX "Audit_auditorId_status_idx" ON "Audit"("auditorId", "status");

-- CreateIndex
CREATE INDEX "Error_auditId_idx" ON "Error"("auditId");

-- CreateIndex
CREATE INDEX "Error_errorType_idx" ON "Error"("errorType");

-- CreateIndex
CREATE INDEX "Error_name_idx" ON "Error"("name");
