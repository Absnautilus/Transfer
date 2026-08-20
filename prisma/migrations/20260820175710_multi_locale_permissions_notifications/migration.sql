/*
  Warnings:

  - You are about to drop the column `description` on the `HotelRoute` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HotelRoute" DROP COLUMN "description",
ADD COLUMN     "descriptionArrival" JSONB,
ADD COLUMN     "descriptionDeparture" JSONB,
ADD COLUMN     "pointCategory" TEXT NOT NULL DEFAULT 'ALTRO';

-- AlterTable
ALTER TABLE "TaxiCompany" ADD COLUMN     "commissionRate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "arrivalMode" TEXT,
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledByUserId" TEXT,
ADD COLUMN     "commissionRateSnapshot" DOUBLE PRECISION,
ADD COLUMN     "estimatedArrivalTime" TEXT,
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'it',
ADD COLUMN     "penaltyAmount" DOUBLE PRECISION,
ADD COLUMN     "penaltyType" TEXT;

-- AlterTable
ALTER TABLE "TransferRequest" ADD COLUMN     "arrivalMode" TEXT,
ADD COLUMN     "estimatedArrivalTime" TEXT,
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'it';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isOrgAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permissions" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_cancelledByUserId_fkey" FOREIGN KEY ("cancelledByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
