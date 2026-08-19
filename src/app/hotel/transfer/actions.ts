"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireHotelUser } from "@/lib/session";
import { TRANSFER_STATUS } from "@/lib/constants";
import { manualTransferSchema } from "@/lib/validations";

export async function createManualTransfer(formData: FormData) {
  const user = await requireHotelUser();
  const parsed = manualTransferSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");
  const data = parsed.data;

  const hotel = await prisma.hotel.findUnique({ where: { id: user.hotelId } });

  const transfer = await prisma.transfer.create({
    data: {
      hotelId: user.hotelId,
      taxiCompanyId: hotel?.primaryTaxiCompanyId ?? null,
      status: TRANSFER_STATUS.AWAITING_TAXI,
      guestName: data.guestName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone || null,
      roomNumber: data.roomNumber || null,
      bookingNumber: data.bookingNumber || null,
      pax: data.pax,
      bags: data.bags || null,
      date: data.date,
      time: data.time,
      isNightService: data.isNightService ?? false,
      routeFrom: data.routeFrom,
      routeTo: data.routeTo,
      flightOrTrainNumber: data.flightOrTrainNumber || null,
      flightOrTrainOrigin: data.flightOrTrainOrigin || null,
      notes: data.notes || null,
      price: data.price ?? null,
      operatorInitials: data.operatorInitials || null,
      createdByUserId: user.id,
    },
  });

  revalidatePath("/hotel/transfer");
  revalidatePath("/taxi/transfer");
  redirect(`/hotel/transfer?date=${transfer.date}`);
}

export async function updateTransfer(formData: FormData) {
  const user = await requireHotelUser();
  const parsed = manualTransferSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");
  const data = parsed.data;
  if (!data.transferId) throw new Error("Transfer mancante.");

  const existing = await prisma.transfer.findFirst({ where: { id: data.transferId, hotelId: user.hotelId } });
  if (!existing) throw new Error("Transfer non trovato.");

  await prisma.transfer.update({
    where: { id: existing.id },
    data: {
      guestName: data.guestName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone || null,
      roomNumber: data.roomNumber || null,
      bookingNumber: data.bookingNumber || null,
      pax: data.pax,
      bags: data.bags || null,
      date: data.date,
      time: data.time,
      isNightService: data.isNightService ?? false,
      routeFrom: data.routeFrom,
      routeTo: data.routeTo,
      flightOrTrainNumber: data.flightOrTrainNumber || null,
      flightOrTrainOrigin: data.flightOrTrainOrigin || null,
      notes: data.notes || null,
      price: data.price ?? null,
      operatorInitials: data.operatorInitials || null,
      updatedByUserId: user.id,
    },
  });

  revalidatePath("/hotel/transfer");
  revalidatePath("/taxi/transfer");
  redirect(`/hotel/transfer?date=${data.date}`);
}

export async function cancelTransfer(transferId: string) {
  const user = await requireHotelUser();
  const existing = await prisma.transfer.findFirst({ where: { id: transferId, hotelId: user.hotelId } });
  if (!existing) throw new Error("Transfer non trovato.");

  await prisma.transfer.update({
    where: { id: existing.id },
    data: { status: TRANSFER_STATUS.CANCELLED, updatedByUserId: user.id },
  });

  revalidatePath("/hotel/transfer");
  revalidatePath("/taxi/transfer");
}
