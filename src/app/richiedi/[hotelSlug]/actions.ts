"use server";

import { prisma } from "@/lib/prisma";
import { guestRequestSchema } from "@/lib/validations";

export type SubmitRequestResult = { ok: true } | { ok: false; error: string };

export async function submitTransferRequest(hotelSlug: string, formData: FormData): Promise<SubmitRequestResult> {
  const hotel = await prisma.hotel.findUnique({ where: { slug: hotelSlug } });
  if (!hotel) return { ok: false, error: "Hotel non trovato." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = guestRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }
  const data = parsed.data;

  await prisma.transferRequest.create({
    data: {
      hotelId: hotel.id,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      roomNumber: data.roomNumber || null,
      bookingNumber: data.bookingNumber || null,
      pax: data.pax,
      bags: data.bags || null,
      date: data.date,
      time: data.time,
      isNightService: data.isNightService ?? false,
      routeLabel: data.routeLabel || null,
      routeFrom: data.routeFrom || null,
      routeTo: data.routeTo || null,
      flightOrTrainNumber: data.flightOrTrainNumber || null,
      flightOrTrainOrigin: data.flightOrTrainOrigin || null,
      notes: data.notes || null,
    },
  });

  return { ok: true };
}
