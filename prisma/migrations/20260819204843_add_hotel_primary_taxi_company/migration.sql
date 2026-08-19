-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hotel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "primaryTaxiCompanyId" TEXT,
    CONSTRAINT "Hotel_primaryTaxiCompanyId_fkey" FOREIGN KEY ("primaryTaxiCompanyId") REFERENCES "TaxiCompany" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hotel" ("address", "createdAt", "email", "id", "name", "phone", "slug") SELECT "address", "createdAt", "email", "id", "name", "phone", "slug" FROM "Hotel";
DROP TABLE "Hotel";
ALTER TABLE "new_Hotel" RENAME TO "Hotel";
CREATE UNIQUE INDEX "Hotel_slug_key" ON "Hotel"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
