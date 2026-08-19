"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireHotelUser } from "@/lib/session";

const createRouteSchema = z.object({
  label: z.string().trim().min(3, "Indica la tratta, es. SAN BASILIO >>> VCE"),
  defaultPrice: z.coerce.number().optional(),
});

export async function createRoute(formData: FormData) {
  const user = await requireHotelUser();
  const parsed = createRouteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");

  const count = await prisma.hotelRoute.count({ where: { hotelId: user.hotelId } });
  await prisma.hotelRoute.create({
    data: { hotelId: user.hotelId, label: parsed.data.label, defaultPrice: parsed.data.defaultPrice ?? null, sortOrder: count },
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
