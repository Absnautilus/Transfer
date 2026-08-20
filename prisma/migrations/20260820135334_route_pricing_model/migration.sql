/*
  Warnings:

  - You are about to drop the column `defaultPrice` on the `HotelRoute` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `HotelRoute` table. All the data in the column will be lost.
  - You are about to drop the column `bags` on the `TransferRequest` table. All the data in the column will be lost.
  - You are about to drop the column `routeLabel` on the `TransferRequest` table. All the data in the column will be lost.
  - Added the required column `pointLabel` to the `HotelRoute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceTiers` to the `HotelRoute` table without a default value. This is not possible if the table is not empty.
  - Made the column `routeFrom` on table `TransferRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `routeTo` on table `TransferRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "HotelRoute" DROP COLUMN "defaultPrice",
DROP COLUMN "label",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "pointLabel" TEXT NOT NULL,
ADD COLUMN     "priceTiers" JSONB NOT NULL,
ADD COLUMN     "transferMode" TEXT;

-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "routeOptionId" TEXT;

-- AlterTable
ALTER TABLE "TransferRequest" DROP COLUMN "bags",
DROP COLUMN "routeLabel",
ADD COLUMN     "bagsCabin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bagsLarge" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bagsStandard" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quotedPrice" DOUBLE PRECISION,
ADD COLUMN     "routeOptionId" TEXT,
ALTER COLUMN "routeFrom" SET NOT NULL,
ALTER COLUMN "routeTo" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_routeOptionId_fkey" FOREIGN KEY ("routeOptionId") REFERENCES "HotelRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_routeOptionId_fkey" FOREIGN KEY ("routeOptionId") REFERENCES "HotelRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
