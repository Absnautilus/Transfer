// Standalone data export, independent of a running Next.js server — for a
// local cron job, a scheduled GitHub Action, or manual use before risky
// changes. Excludes passwordHash (credentials aren't backed up; reset them
// instead of restoring them). Writes to backups/backup-<timestamp>.json.
//
//   npm run db:backup
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [hotels, taxiCompanies, hotelRoutes, users, drivers, transferRequests, transfers, tripStatusEvents, notifications] =
    await Promise.all([
      prisma.hotel.findMany(),
      prisma.taxiCompany.findMany(),
      prisma.hotelRoute.findMany(),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          isOrgAdmin: true,
          permissions: true,
          hotelId: true,
          taxiCompanyId: true,
          driverId: true,
          createdAt: true,
        },
      }),
      prisma.driver.findMany(),
      prisma.transferRequest.findMany(),
      prisma.transfer.findMany(),
      prisma.tripStatusEvent.findMany(),
      prisma.notification.findMany(),
    ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    hotels,
    taxiCompanies,
    hotelRoutes,
    users,
    drivers,
    transferRequests,
    transfers,
    tripStatusEvents,
    notifications,
  };

  const dir = join(process.cwd(), "backups");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(payload, null, 2));
  console.log(`Backup salvato in ${file}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
