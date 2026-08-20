-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "bagsPersonal" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TransferRequest" ADD COLUMN     "bagsPersonal" INTEGER NOT NULL DEFAULT 0;
