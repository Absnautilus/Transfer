"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTaxiOrgAdmin } from "@/lib/session";

export async function setTaxiStaffAdmin(userId: string, isOrgAdmin: boolean) {
  const admin = await requireTaxiOrgAdmin();
  const target = await prisma.user.findFirst({ where: { id: userId, taxiCompanyId: admin.taxiCompanyId } });
  if (!target) throw new Error("Utente non trovato.");
  if (target.id === admin.id) throw new Error("Non puoi modificare il tuo stesso account.");

  await prisma.user.update({ where: { id: target.id }, data: { isOrgAdmin } });
  revalidatePath("/taxi/team");
}
