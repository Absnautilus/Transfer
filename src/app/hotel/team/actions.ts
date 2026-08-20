"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireHotelOrgAdmin } from "@/lib/session";

export async function setHotelStaffAdmin(userId: string, isOrgAdmin: boolean) {
  const admin = await requireHotelOrgAdmin();
  const target = await prisma.user.findFirst({ where: { id: userId, hotelId: admin.hotelId } });
  if (!target) throw new Error("Utente non trovato.");
  if (target.id === admin.id) throw new Error("Non puoi modificare il tuo stesso account.");

  await prisma.user.update({ where: { id: target.id }, data: { isOrgAdmin } });
  revalidatePath("/hotel/team");
}
