import { prisma } from "@/lib/prisma";

// Full data export excluding credentials (passwordHash) — used by both the
// admin "download backup" button and the standalone backup script. Restoring
// from this file means re-importing each array with prisma.<model>.createMany.
export async function buildBackupPayload() {
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

  return {
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
}
