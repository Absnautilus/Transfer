"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireHotelUser } from "@/lib/session";
import type { PriceTiers } from "@/lib/pricing";

const priceField = z.coerce.number().min(0).optional().default(0);

const createRouteSchema = z.object({
  pointLabel: z.string().trim().min(2, "Indica il punto, es. Aeroporto Marco Polo (VCE)"),
  transferMode: z.string().trim().optional(),
  description: z.string().trim().optional(),
  durationMinutes: z.coerce.number().int().min(0).optional(),
  dayPrice1_4: priceField,
  dayPrice5: priceField,
  dayPrice6: priceField,
  dayPrice7: priceField,
  dayPrice8: priceField,
  nightPrice1_4: priceField,
  nightPrice5: priceField,
  nightPrice6: priceField,
  nightPrice7: priceField,
  nightPrice8: priceField,
});

function buildPriceTiers(data: z.infer<typeof createRouteSchema>): PriceTiers {
  return {
    day: {
      "1-4": data.dayPrice1_4,
      "5": data.dayPrice5,
      "6": data.dayPrice6,
      "7": data.dayPrice7,
      "8": data.dayPrice8,
    },
    night: {
      "1-4": data.nightPrice1_4,
      "5": data.nightPrice5,
      "6": data.nightPrice6,
      "7": data.nightPrice7,
      "8": data.nightPrice8,
    },
  };
}

export async function createRoute(formData: FormData) {
  const user = await requireHotelUser();
  const parsed = createRouteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");

  const count = await prisma.hotelRoute.count({ where: { hotelId: user.hotelId } });
  await prisma.hotelRoute.create({
    data: {
      hotelId: user.hotelId,
      pointLabel: parsed.data.pointLabel,
      transferMode: parsed.data.transferMode || null,
      description: parsed.data.description || null,
      durationMinutes: parsed.data.durationMinutes ?? null,
      priceTiers: buildPriceTiers(parsed.data),
      sortOrder: count,
    },
  });

  revalidatePath("/hotel/tratte");
  revalidatePath(`/richiedi`);
}

export async function toggleRouteActive(routeId: string) {
  const user = await requireHotelUser();
  const route = await prisma.hotelRoute.findFirst({ where: { id: routeId, hotelId: user.hotelId } });
  if (!route) throw new Error("Tratta non trovata.");
  await prisma.hotelRoute.update({ where: { id: route.id }, data: { active: !route.active } });
  revalidatePath("/hotel/tratte");
}
