-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TaxiCompany" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HotelRoute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "defaultPrice" REAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HotelRoute_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hotelId" TEXT,
    "taxiCompanyId" TEXT,
    "driverId" TEXT,
    CONSTRAINT "User_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_taxiCompanyId_fkey" FOREIGN KEY ("taxiCompanyId") REFERENCES "TaxiCompany" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taxiCompanyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "vehicleInfo" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Driver_taxiCompanyId_fkey" FOREIGN KEY ("taxiCompanyId") REFERENCES "TaxiCompany" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestPhone" TEXT NOT NULL,
    "roomNumber" TEXT,
    "bookingNumber" TEXT,
    "pax" INTEGER NOT NULL,
    "bags" TEXT,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "isNightService" BOOLEAN NOT NULL DEFAULT false,
    "routeLabel" TEXT,
    "routeFrom" TEXT,
    "routeTo" TEXT,
    "flightOrTrainNumber" TEXT,
    "flightOrTrainOrigin" TEXT,
    "notes" TEXT,
    "reviewedAt" DATETIME,
    "reviewedByUserId" TEXT,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransferRequest_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TransferRequest_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "taxiCompanyId" TEXT,
    "requestId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AWAITING_TAXI',
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "roomNumber" TEXT,
    "bookingNumber" TEXT,
    "pax" INTEGER NOT NULL,
    "bags" TEXT,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "isNightService" BOOLEAN NOT NULL DEFAULT false,
    "routeFrom" TEXT NOT NULL,
    "routeTo" TEXT NOT NULL,
    "flightOrTrainNumber" TEXT,
    "flightOrTrainOrigin" TEXT,
    "notes" TEXT,
    "price" REAL,
    "operatorInitials" TEXT,
    "taxiRejectionReason" TEXT,
    "driverId" TEXT,
    "guestTrackingToken" TEXT NOT NULL,
    "tripStartedAt" DATETIME,
    "tripCompletedAt" DATETIME,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transfer_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transfer_taxiCompanyId_fkey" FOREIGN KEY ("taxiCompanyId") REFERENCES "TaxiCompany" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transfer_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransferRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transfer_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transfer_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transfer_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TripStatusEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transferId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TripStatusEvent_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_slug_key" ON "Hotel"("slug");

-- CreateIndex
CREATE INDEX "HotelRoute_hotelId_idx" ON "HotelRoute"("hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_driverId_key" ON "User"("driverId");

-- CreateIndex
CREATE INDEX "User_hotelId_idx" ON "User"("hotelId");

-- CreateIndex
CREATE INDEX "User_taxiCompanyId_idx" ON "User"("taxiCompanyId");

-- CreateIndex
CREATE INDEX "Driver_taxiCompanyId_idx" ON "Driver"("taxiCompanyId");

-- CreateIndex
CREATE INDEX "TransferRequest_hotelId_status_idx" ON "TransferRequest"("hotelId", "status");

-- CreateIndex
CREATE INDEX "TransferRequest_hotelId_date_idx" ON "TransferRequest"("hotelId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_requestId_key" ON "Transfer"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_guestTrackingToken_key" ON "Transfer"("guestTrackingToken");

-- CreateIndex
CREATE INDEX "Transfer_hotelId_date_idx" ON "Transfer"("hotelId", "date");

-- CreateIndex
CREATE INDEX "Transfer_taxiCompanyId_date_idx" ON "Transfer"("taxiCompanyId", "date");

-- CreateIndex
CREATE INDEX "Transfer_driverId_idx" ON "Transfer"("driverId");

-- CreateIndex
CREATE INDEX "Transfer_bookingNumber_idx" ON "Transfer"("bookingNumber");

-- CreateIndex
CREATE INDEX "Transfer_guestName_idx" ON "Transfer"("guestName");

-- CreateIndex
CREATE INDEX "TripStatusEvent_transferId_idx" ON "TripStatusEvent"("transferId");
