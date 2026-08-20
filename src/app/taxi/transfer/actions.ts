"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTaxiUser } from "@/lib/session";
import { TRANSFER_STATUS, TRIP_EVENT } from "@/lib/constants";
import { notifyHotelStaff } from "@/lib/notifications";

async function loadOwnedTransfer(transferId: string, taxiCompanyId: string) {
  const transfer = await prisma.transfer.findFirst({ where: { id: transferId, taxiCompanyId } });
  if (!transfer) throw new Error("Transfer non trovato.");
  return transfer;
}

export async function confirmTransfer(transferId: string) {
  const user = await requireTaxiUser();
  const transfer = await loadOwnedTransfer(transferId, user.taxiCompanyId);

  await prisma.transfer.update({
    where: { id: transferId },
    data: { status: TRANSFER_STATUS.CONFIRMED, updatedByUserId: user.id, taxiRejectionReason: null },
  });

  await notifyHotelStaff(transfer.hotelId, {
    type: "TRANSFER_CONFIRMED",
    title: "Transfer confermato dal taxi",
    body: `${transfer.guestName} — ${transfer.date} ${transfer.time}`,
    link: "/hotel/transfer",
  });

  revalidatePath("/taxi/transfer");
  revalidatePath("/hotel/transfer");
}

export async function rejectTransfer(formData: FormData) {
  const user = await requireTaxiUser();
  const transferId = String(formData.get("transferId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) throw new Error("Indica il motivo del rifiuto.");
  const transfer = await loadOwnedTransfer(transferId, user.taxiCompanyId);

  await prisma.transfer.update({
    where: { id: transferId },
    data: { status: TRANSFER_STATUS.REJECTED_BY_TAXI, taxiRejectionReason: reason, updatedByUserId: user.id },
  });

  await notifyHotelStaff(transfer.hotelId, {
    type: "TRANSFER_REJECTED",
    title: "Transfer rifiutato dal taxi",
    body: `${transfer.guestName} — ${reason}`,
    link: "/hotel/transfer",
  });

  revalidatePath("/taxi/transfer");
  revalidatePath("/hotel/transfer");
}

export async function assignDriver(transferId: string, driverId: string) {
  const user = await requireTaxiUser();
  const transfer = await loadOwnedTransfer(transferId, user.taxiCompanyId);

  if (!driverId) {
    await prisma.transfer.update({
      where: { id: transferId },
      data: {
        driverId: null,
        status: transfer.status === TRANSFER_STATUS.ASSIGNED ? TRANSFER_STATUS.CONFIRMED : transfer.status,
        updatedByUserId: user.id,
      },
    });
    revalidatePath("/taxi/transfer");
    revalidatePath("/hotel/transfer");
    return;
  }

  const driver = await prisma.driver.findFirst({ where: { id: driverId, taxiCompanyId: user.taxiCompanyId } });
  if (!driver) throw new Error("Autista non trovato.");

  const nextStatus =
    transfer.status === TRANSFER_STATUS.IN_PROGRESS || transfer.status === TRANSFER_STATUS.COMPLETED
      ? transfer.status
      : TRANSFER_STATUS.ASSIGNED;

  await prisma.$transaction([
    prisma.transfer.update({
      where: { id: transferId },
      data: { driverId, status: nextStatus, updatedByUserId: user.id },
    }),
    prisma.tripStatusEvent.create({
      data: { transferId, status: TRIP_EVENT.ASSIGNED, note: `Assegnato a ${driver.name}` },
    }),
  ]);

  revalidatePath("/taxi/transfer");
  revalidatePath("/hotel/transfer");
  revalidatePath(`/driver`);
}
