-- CreateTable
CREATE TABLE "Auditor" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Auditor',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditedUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "department" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "supervisor" TEXT NOT NULL,

    CONSTRAINT "AuditedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in-progress',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedDate" TIMESTAMP(3),
    "reportSent" BOOLEAN NOT NULL DEFAULT false,
    "auditorId" TEXT NOT NULL,
    "auditedUserId" TEXT NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Error" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "processedDate" TIMESTAMP(3),
    "parisMVS" TEXT,
    "userProcessedMVS" TEXT,
    "existingParisMVS" TEXT,
    "incorrectHeader" TEXT,
    "correctHeader" TEXT,
    "workType" TEXT,
    "cueSequence" TEXT,
    "addedWorkMVS" TEXT,
    "existingWorkMVS" TEXT,
    "incorrectValue" TEXT,
    "correctValue" TEXT,
    "incorrectName" TEXT,
    "correctName" TEXT,
    "correctIPI" TEXT,
    "missingName" TEXT,
    "additionalName" TEXT,
    "notes" TEXT,
    "customPoints" DOUBLE PRECISION,

    CONSTRAINT "Error_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auditor_email_key" ON "Auditor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuditedUser_email_key" ON "AuditedUser"("email");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "Auditor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_auditedUserId_fkey" FOREIGN KEY ("auditedUserId") REFERENCES "AuditedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Error" ADD CONSTRAINT "Error_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
