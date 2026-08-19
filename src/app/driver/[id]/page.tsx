import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireDriverUser } from "@/lib/session";
import { TripStatusView } from "@/components/trip-status-view";
import { DriverTripActions } from "./driver-actions";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export default async function DriverTripPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireDriverUser();
  const { id } = await params;
  const transfer = await prisma.transfer.findFirst({
    where: { id, driverId: user.driverId },
    include: { driver: true, statusEvents: { orderBy: { createdAt: "asc" } } },
  });
  if (!transfer) notFound();

  const reached = new Set(transfer.statusEvents.map((e) => e.status));

  return (
    <div className="mx-auto max-w-md">
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
      >
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-700">Aggiorna stato</h3>
          </CardHeader>
          <CardBody>
            <DriverTripActions transferId={transfer.id} reached={reached} />
          </CardBody>
        </Card>
        <p className="mt-3 text-center text-xs text-slate-400">
          Link condiviso con l&apos;ospite: {APP_URL}/traccia/{transfer.guestTrackingToken}
        </p>
      </TripStatusView>
    </div>
  );
}
