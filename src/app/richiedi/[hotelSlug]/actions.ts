"use server";

import { prisma } from "@/lib/prisma";
import { guestRequestSchema } from "@/lib/validations";
import { computePrice, isValidPriceTiers } from "@/lib/pricing";

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

  const routeOption = await prisma.hotelRoute.findFirst({
    where: { id: data.routeOptionId, hotelId: hotel.id, active: true },
  });
  if (!routeOption) return { ok: false, error: "La tratta selezionata non è più disponibile." };

  const routeFrom = data.direction === "ARRIVO" ? routeOption.pointLabel : hotel.name;
  const routeTo = data.direction === "ARRIVO" ? hotel.name : routeOption.pointLabel;
  const quotedPrice = isValidPriceTiers(routeOption.priceTiers)
    ? computePrice(routeOption.priceTiers, data.pax, data.isNightService)
    : null;

  await prisma.transferRequest.create({
    data: {
      hotelId: hotel.id,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      roomNumber: data.roomNumber || null,
      bookingNumber: data.bookingNumber || null,
      pax: data.pax,
      bagsCabin: data.bagsCabin,
      bagsStandard: data.bagsStandard,
      bagsLarge: data.bagsLarge,
      date: data.date,
      time: data.time,
      isNightService: data.isNightService,
      routeOptionId: routeOption.id,
      routeFrom,
      routeTo,
      quotedPrice,
      flightOrTrainNumber: data.flightOrTrainNumber || null,
      flightOrTrainOrigin: data.flightOrTrainOrigin || null,
      notes: data.notes || null,
    },
  });

  return { ok: true };
}
