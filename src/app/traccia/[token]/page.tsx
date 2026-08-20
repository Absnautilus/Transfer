import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TripStatusView } from "@/components/trip-status-view";
import { AutoRefresh } from "@/components/auto-refresh";
import { PublicHeader } from "@/components/public-header";

export default async function GuestTrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const transfer = await prisma.transfer.findUnique({
    where: { guestTrackingToken: token },
    include: { driver: true, statusEvents: { orderBy: { createdAt: "asc" } }, hotel: true },
  });

  if (!transfer) notFound();

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <AutoRefresh />
      <PublicHeader />
      <div className="mx-auto max-w-md px-4 pt-4">
        <p className="mb-4 text-center text-sm font-medium text-slate-500">{transfer.hotel.name}</p>
        <TripStatusView
          trip={{
            guestName: transfer.guestName,
            routeFrom: transfer.routeFrom,
            routeTo: transfer.routeTo,
            date: transfer.date,
            time: transfer.time,
            driverName: transfer.driver?.name ?? null,
            driverPhone: transfer.driver?.phone ?? null,
            events: transfer.statusEvents.map((e) => ({ status: e.status, createdAt: e.createdAt.toISOString() })),
          }}
        />
        <p className="mt-4 text-center text-xs text-slate-400">Questa pagina si aggiorna automaticamente.</p>
      </div>
    </div>
  );
}
