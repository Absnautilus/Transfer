"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireTaxiUser } from "@/lib/session";
import { ROLES } from "@/lib/constants";
import { z } from "zod";

const createDriverSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(5),
  vehicleInfo: z.string().trim().optional(),
  email: z.string().trim().email(),
  password: z.string().min(6, "Almeno 6 caratteri"),
});

export async function createDriver(formData: FormData) {
  const user = await requireTaxiUser();
  const parsed = createDriverSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");
  const data = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existingUser) throw new Error("Email già in uso.");

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.$transaction(async (tx) => {
    const driver = await tx.driver.create({
      data: {
        taxiCompanyId: user.taxiCompanyId,
        name: data.name,
        phone: data.phone,
        vehicleInfo: data.vehicleInfo || null,
      },
    });
    await tx.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        role: ROLES.DRIVER,
        phone: data.phone,
        taxiCompanyId: user.taxiCompanyId,
        driverId: driver.id,
      },
    });
  });

  revalidatePath("/taxi/autisti");
}

export async function toggleDriverActive(driverId: string) {
  const user = await requireTaxiUser();
  const driver = await prisma.driver.findFirst({ where: { id: driverId, taxiCompanyId: user.taxiCompanyId } });
  if (!driver) throw new Error("Autista non trovato.");
  await prisma.driver.update({ where: { id: driver.id }, data: { active: !driver.active } });
  revalidatePath("/taxi/autisti");
}
