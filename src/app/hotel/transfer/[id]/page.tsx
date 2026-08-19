import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireHotelUser } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { TransferForm } from "../transfer-form";
import { updateTransfer } from "../actions";

export default async function EditTransferPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireHotelUser();
  const { id } = await params;
  const transfer = await prisma.transfer.findFirst({ where: { id, hotelId: user.hotelId } });
  if (!transfer) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Modifica transfer</h1>
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">{transfer.guestName}</h2>
        </CardHeader>
        <CardBody>
          <TransferForm
            initial={{
              transferId: transfer.id,
              guestName: transfer.guestName,
              guestEmail: transfer.guestEmail,
              guestPhone: transfer.guestPhone,
              roomNumber: transfer.roomNumber,
              bookingNumber: transfer.bookingNumber,
              pax: transfer.pax,
              bags: transfer.bags,
              date: transfer.date,
              time: transfer.time,
              isNightService: transfer.isNightService,
              routeFrom: transfer.routeFrom,
              routeTo: transfer.routeTo,
              flightOrTrainNumber: transfer.flightOrTrainNumber,
              flightOrTrainOrigin: transfer.flightOrTrainOrigin,
              notes: transfer.notes,
              price: transfer.price,
              operatorInitials: transfer.operatorInitials,
            }}
            action={updateTransfer}
            submitLabel="Salva modifiche"
          />
        </CardBody>
      </Card>
    </div>
  );
}
