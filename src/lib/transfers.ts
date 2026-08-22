import { prisma } from "@/lib/prisma";
import { todayISO } from "@/lib/date";

export { todayISO };

export async function getTransfers(scope: { hotelId?: string; taxiCompanyId?: string }, filters: { date?: string; q?: string }) {
  const where: Record<string, unknown> = {};
  if (scope.hotelId) where.hotelId = scope.hotelId;
  if (scope.taxiCompanyId) where.taxiCompanyId = scope.taxiCompanyId;

  if (filters.q && filters.q.trim().length > 0) {
    const q = filters.q.trim();
    where.OR = [
      { guestFirstName: { contains: q } },
      { guestLastName: { contains: q } },
      { bookingNumber: { contains: q } },
      { roomNumber: { contains: q } },
    ];
  } else if (filters.date) {
    where.date = filters.date;
  } else {
    // No explicit date picked: show everything from today onward instead of
    // just today, so a transfer confirmed for a future date (the common
    // case) doesn't silently disappear from the default view.
    where.date = { gte: todayISO() };
  }

  return prisma.transfer.findMany({
    where,
    include: { driver: true, statusEvents: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
}
