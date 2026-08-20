import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { TransferForm } from "../transfer-form";
import { createManualTransfer } from "../actions";
import { todayISO } from "@/lib/transfers";
import { requireHotelUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function NewTransferPage() {
  const user = await requireHotelUser();
  const [hotel, routes] = await Promise.all([
    prisma.hotel.findUnique({ where: { id: user.hotelId } }),
    prisma.hotelRoute.findMany({ where: { hotelId: user.hotelId }, select: { pointLabel: true }, distinct: ["pointLabel"] }),
  ]);
  const routePoints = Array.from(new Set([hotel?.name, ...routes.map((r) => r.pointLabel)].filter((v): v is string => Boolean(v))));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Nuovo transfer</h1>
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Inserimento manuale</h2>
        </CardHeader>
        <CardBody>
          <TransferForm
            initial={{ guestFirstName: "", guestLastName: "", pax: 1, date: todayISO(), time: "09:00", routeFrom: "", routeTo: "" }}
            action={createManualTransfer}
            submitLabel="Crea transfer"
            routePoints={routePoints}
          />
        </CardBody>
      </Card>
    </div>
  );
}
