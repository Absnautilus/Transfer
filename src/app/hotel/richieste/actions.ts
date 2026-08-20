"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireHotelUser } from "@/lib/session";
import { REQUEST_STATUS, TRANSFER_STATUS } from "@/lib/constants";
import { rejectRequestSchema } from "@/lib/validations";
import { sendRequestAcceptedEmail, sendRequestRejectedEmail } from "@/lib/emails";
import { formatBags } from "@/lib/bags";
import { notifyTaxiStaff } from "@/lib/notifications";

export async function acceptRequest(requestId: string) {
  const user = await requireHotelUser();

  const request = await prisma.transferRequest.findFirst({
    where: { id: requestId, hotelId: user.hotelId, status: REQUEST_STATUS.PENDING },
    include: { hotel: { include: { primaryTaxiCompany: true } } },
  });
  if (!request) throw new Error("Richiesta non trovata.");

  const transfer = await prisma.$transaction(async (tx) => {
    await tx.transferRequest.update({
      where: { id: request.id },
      data: { status: REQUEST_STATUS.ACCEPTED, reviewedAt: new Date(), reviewedByUserId: user.id },
    });

    return tx.transfer.create({
      data: {
        hotelId: request.hotelId,
        taxiCompanyId: request.hotel.primaryTaxiCompanyId,
        requestId: request.id,
        status: TRANSFER_STATUS.AWAITING_TAXI,
        guestName: request.guestName,
        guestEmail: request.guestEmail,
        guestPhone: request.guestPhone,
        roomNumber: request.roomNumber,
        bookingNumber: request.bookingNumber,
        pax: request.pax,
        bags: formatBags(request.bagsCabin, request.bagsStandard, request.bagsLarge),
        date: request.date,
        time: request.time,
        isNightService: request.isNightService,
        routeOptionId: request.routeOptionId,
        routeFrom: request.routeFrom,
        routeTo: request.routeTo,
        price: request.quotedPrice,
        arrivalMode: request.arrivalMode,
        estimatedArrivalTime: request.estimatedArrivalTime,
        flightOrTrainNumber: request.flightOrTrainNumber,
        flightOrTrainOrigin: request.flightOrTrainOrigin,
        notes: request.notes,
        locale: request.locale,
        commissionRateSnapshot: request.hotel.primaryTaxiCompany?.commissionRate ?? null,
        createdByUserId: user.id,
      },
    });
  });

  if (request.hotel.primaryTaxiCompanyId) {
    await notifyTaxiStaff(request.hotel.primaryTaxiCompanyId, {
      type: "TRANSFER_NEW",
      title: "Nuovo transfer da confermare",
      body: `${transfer.guestName} — ${transfer.date} ${transfer.time}`,
      link: "/taxi/transfer",
    });
  }

  await sendRequestAcceptedEmail({
    guestEmail: request.guestEmail,
    guestName: request.guestName,
    hotelName: request.hotel.name,
    date: request.date,
    time: request.time,
    routeFrom: transfer.routeFrom,
    routeTo: transfer.routeTo,
    trackingToken: transfer.guestTrackingToken,
  });

  revalidatePath("/hotel/richieste");
  revalidatePath("/hotel/transfer");
  revalidatePath("/taxi/transfer");
}

export async function rejectRequest(formData: FormData) {
  const user = await requireHotelUser();
  const parsed = rejectRequestSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");

  const request = await prisma.transferRequest.findFirst({
    where: { id: parsed.data.requestId, hotelId: user.hotelId, status: REQUEST_STATUS.PENDING },
    include: { hotel: true },
  });
  if (!request) throw new Error("Richiesta non trovata.");

  await prisma.transferRequest.update({
    where: { id: request.id },
    data: {
      status: REQUEST_STATUS.REJECTED,
      reviewedAt: new Date(),
      reviewedByUserId: user.id,
      rejectionReason: parsed.data.reason,
    },
  });

  await sendRequestRejectedEmail({
    guestEmail: request.guestEmail,
    guestName: request.guestName,
    hotelName: request.hotel.name,
    reason: parsed.data.reason,
  });

  revalidatePath("/hotel/richieste");
}
