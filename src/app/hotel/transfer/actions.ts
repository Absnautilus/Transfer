"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireHotelUser } from "@/lib/session";
import { TRANSFER_STATUS } from "@/lib/constants";
import { manualTransferSchema } from "@/lib/validations";
import { notifyTaxiStaff } from "@/lib/notifications";
import { isNightTime } from "@/lib/night";
import { deriveInitials } from "@/lib/initials";
import { formatBags } from "@/lib/bags";

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
      guestFirstName: data.guestFirstName,
      guestLastName: data.guestLastName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone || null,
      roomNumber: data.roomNumber || null,
      bookingNumber: data.bookingNumber || null,
      pax: data.pax,
      bags: formatBags(data.bagsCabin, data.bagsStandard, data.bagsLarge),
      bagsCabin: data.bagsCabin,
      bagsStandard: data.bagsStandard,
      bagsLarge: data.bagsLarge,
      date: data.date,
      time: data.time,
      isNightService: isNightTime(data.time),
      routeFrom: data.routeFrom,
      routeTo: data.routeTo,
      flightOrTrainNumber: data.flightOrTrainNumber || null,
      flightOrTrainOrigin: data.flightOrTrainOrigin || null,
      notes: data.notes || null,
      price: data.price ?? null,
      priceAdjustmentType: data.priceAdjustmentType === "NONE" ? null : data.priceAdjustmentType,
      priceAdjustmentAmount: data.priceAdjustmentType !== "NONE" ? data.priceAdjustmentAmount ?? null : null,
      operatorInitials: deriveInitials(user.name ?? user.email ?? ""),
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
      guestFirstName: data.guestFirstName,
      guestLastName: data.guestLastName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone || null,
      roomNumber: data.roomNumber || null,
      bookingNumber: data.bookingNumber || null,
      pax: data.pax,
      bags: formatBags(data.bagsCabin, data.bagsStandard, data.bagsLarge),
      bagsCabin: data.bagsCabin,
      bagsStandard: data.bagsStandard,
      bagsLarge: data.bagsLarge,
      date: data.date,
      time: data.time,
      isNightService: isNightTime(data.time),
      routeFrom: data.routeFrom,
      routeTo: data.routeTo,
      flightOrTrainNumber: data.flightOrTrainNumber || null,
      flightOrTrainOrigin: data.flightOrTrainOrigin || null,
      notes: data.notes || null,
      price: data.price ?? null,
      priceAdjustmentType: data.priceAdjustmentType === "NONE" ? null : data.priceAdjustmentType,
      priceAdjustmentAmount: data.priceAdjustmentType !== "NONE" ? data.priceAdjustmentAmount ?? null : null,
      operatorInitials: deriveInitials(user.name ?? user.email ?? ""),
      updatedByUserId: user.id,
    },
  });

  revalidatePath("/hotel/transfer");
  revalidatePath("/taxi/transfer");
  redirect(`/hotel/transfer?date=${data.date}`);
}

export async function cancelTransfer(formData: FormData) {
  const user = await requireHotelUser();
  const transferId = String(formData.get("transferId") ?? "");
  const cancellationReason = String(formData.get("cancellationReason") ?? "").trim();
  const penaltyTypeRaw = String(formData.get("penaltyType") ?? "NONE");
  const penaltyType = ["NONE", "FULL", "PARTIAL"].includes(penaltyTypeRaw) ? penaltyTypeRaw : "NONE";
  const penaltyAmountRaw = formData.get("penaltyAmount");
  const penaltyAmount = penaltyType === "PARTIAL" && penaltyAmountRaw ? Number(penaltyAmountRaw) : null;

  const existing = await prisma.transfer.findFirst({ where: { id: transferId, hotelId: user.hotelId } });
  if (!existing) throw new Error("Transfer non trovato.");

  await prisma.transfer.update({
    where: { id: existing.id },
    data: {
      status: TRANSFER_STATUS.CANCELLED,
      updatedByUserId: user.id,
      cancelledAt: new Date(),
      cancelledByUserId: user.id,
      cancellationReason: cancellationReason || null,
      penaltyType,
      penaltyAmount,
    },
  });

  if (existing.taxiCompanyId) {
    await notifyTaxiStaff(existing.taxiCompanyId, {
      type: "TRANSFER_CANCELLED",
      title: "Transfer annullato dall'hotel",
      body: `${existing.guestFirstName} ${existing.guestLastName} — ${existing.date} ${existing.time}`,
      link: "/taxi/transfer",
    });
  }

  revalidatePath("/hotel/transfer");
  revalidatePath("/taxi/transfer");
}
