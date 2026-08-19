"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireDriverUser } from "@/lib/session";
import { TRANSFER_STATUS, TRIP_EVENT, type TripEvent } from "@/lib/constants";

async function loadOwnTransfer(transferId: string, driverId: string) {
  const transfer = await prisma.transfer.findFirst({ where: { id: transferId, driverId } });
  if (!transfer) throw new Error("Transfer non trovato.");
  return transfer;
}

export async function addTripEvent(transferId: string, event: TripEvent) {
  const user = await requireDriverUser();
  await loadOwnTransfer(transferId, user.driverId);

  const statusForEvent: Partial<Record<TripEvent, string>> = {
    [TRIP_EVENT.EN_ROUTE]: TRANSFER_STATUS.ASSIGNED,
    [TRIP_EVENT.ARRIVED]: TRANSFER_STATUS.ASSIGNED,
    [TRIP_EVENT.STARTED]: TRANSFER_STATUS.IN_PROGRESS,
    [TRIP_EVENT.COMPLETED]: TRANSFER_STATUS.COMPLETED,
  };

  const extra: Record<string, unknown> = {};
  if (event === TRIP_EVENT.STARTED) extra.tripStartedAt = new Date();
  if (event === TRIP_EVENT.COMPLETED) extra.tripCompletedAt = new Date();

  await prisma.$transaction([
    prisma.transfer.update({
      where: { id: transferId },
      data: { status: statusForEvent[event] ?? undefined, ...extra },
    }),
    prisma.tripStatusEvent.create({ data: { transferId, status: event } }),
  ]);

  revalidatePath(`/driver/${transferId}`);
  revalidatePath("/driver");
  revalidatePath("/hotel/transfer");
  revalidatePath("/taxi/transfer");
}
