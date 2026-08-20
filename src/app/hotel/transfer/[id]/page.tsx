import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireHotelUser } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { TransferForm } from "../transfer-form";
import { updateTransfer } from "../actions";

export default async function EditTransferPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireHotelUser();
  const { id } = await params;
  const [transfer, hotel, routes] = await Promise.all([
    prisma.transfer.findFirst({ where: { id, hotelId: user.hotelId } }),
    prisma.hotel.findUnique({ where: { id: user.hotelId } }),
    prisma.hotelRoute.findMany({ where: { hotelId: user.hotelId }, select: { pointLabel: true }, distinct: ["pointLabel"] }),
  ]);
  if (!transfer) notFound();
  const routePoints = Array.from(new Set([hotel?.name, ...routes.map((r) => r.pointLabel)].filter((v): v is string => Boolean(v))));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Modifica transfer</h1>
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">
            {transfer.guestFirstName} {transfer.guestLastName}
          </h2>
        </CardHeader>
        <CardBody>
          <TransferForm
            initial={{
              transferId: transfer.id,
              guestFirstName: transfer.guestFirstName,
              guestLastName: transfer.guestLastName,
              guestEmail: transfer.guestEmail,
              guestPhone: transfer.guestPhone,
              roomNumber: transfer.roomNumber,
              bookingNumber: transfer.bookingNumber,
              pax: transfer.pax,
              bagsPersonal: transfer.bagsPersonal,
              bagsCabin: transfer.bagsCabin,
              bagsStandard: transfer.bagsStandard,
              bagsLarge: transfer.bagsLarge,
              date: transfer.date,
              time: transfer.time,
              routeFrom: transfer.routeFrom,
              routeTo: transfer.routeTo,
              flightOrTrainNumber: transfer.flightOrTrainNumber,
              flightOrTrainOrigin: transfer.flightOrTrainOrigin,
              notes: transfer.notes,
              price: transfer.price,
              priceAdjustmentType: transfer.priceAdjustmentType,
              priceAdjustmentAmount: transfer.priceAdjustmentAmount,
            }}
            action={updateTransfer}
            submitLabel="Salva modifiche"
            routePoints={routePoints}
          />
        </CardBody>
      </Card>
    </div>
  );
}
