"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ROLES } from "@/lib/constants";
import { createHotelSchema, createTaxiCompanySchema, createAdminUserSchema, createOperatorSchema } from "@/lib/validations";

export async function createHotel(formData: FormData) {
  await requireAdmin();
  const parsed = createHotelSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");
  const data = parsed.data;

  const existingSlug = await prisma.hotel.findUnique({ where: { slug: data.slug } });
  if (existingSlug) throw new Error("Slug già in uso da un altro hotel.");

  const staffEmail = String(formData.get("staffEmail") ?? "").trim().toLowerCase();
  const staffPassword = String(formData.get("staffPassword") ?? "");
  const staffName = String(formData.get("staffName") ?? "").trim();
  if (!staffEmail || staffPassword.length < 6 || !staffName) {
    throw new Error("Indica nome, email e password (min. 6 caratteri) per il primo operatore dell'hotel.");
  }
  const existingUser = await prisma.user.findUnique({ where: { email: staffEmail } });
  if (existingUser) throw new Error("Email operatore già in uso.");

  const passwordHash = await bcrypt.hash(staffPassword, 10);

  await prisma.$transaction(async (tx) => {
    const hotel = await tx.hotel.create({
      data: {
        name: data.name,
        slug: data.slug,
        address: data.address || null,
        email: data.email || null,
        phone: data.phone || null,
        primaryTaxiCompanyId: data.primaryTaxiCompanyId || null,
      },
    });
    await tx.user.create({
      data: {
        email: staffEmail,
        passwordHash,
        name: staffName,
        role: ROLES.HOTEL_STAFF,
        hotelId: hotel.id,
        isOrgAdmin: true,
      },
    });
  });

  revalidatePath("/admin/hotels");
}

export async function createTaxiCompany(formData: FormData) {
  await requireAdmin();
  const parsed = createTaxiCompanySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");
  const data = parsed.data;

  const staffEmail = String(formData.get("staffEmail") ?? "").trim().toLowerCase();
  const staffPassword = String(formData.get("staffPassword") ?? "");
  const staffName = String(formData.get("staffName") ?? "").trim();
  if (!staffEmail || staffPassword.length < 6 || !staffName) {
    throw new Error("Indica nome, email e password (min. 6 caratteri) per il primo operatore della compagnia.");
  }
  const existingUser = await prisma.user.findUnique({ where: { email: staffEmail } });
  if (existingUser) throw new Error("Email operatore già in uso.");

  const passwordHash = await bcrypt.hash(staffPassword, 10);

  await prisma.$transaction(async (tx) => {
    const taxiCompany = await tx.taxiCompany.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        commissionRate: data.commissionRate ?? null,
      },
    });
    await tx.user.create({
      data: {
        email: staffEmail,
        passwordHash,
        name: staffName,
        role: ROLES.TAXI_STAFF,
        taxiCompanyId: taxiCompany.id,
        isOrgAdmin: true,
      },
    });
  });

  revalidatePath("/admin/taxi-companies");
}

export async function createOperator(formData: FormData) {
  await requireAdmin();
  const parsed = createOperatorSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");
  const data = parsed.data;

  const email = data.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email già in uso.");

  if (data.orgType === "HOTEL") {
    const hotel = await prisma.hotel.findUnique({ where: { id: data.orgId } });
    if (!hotel) throw new Error("Hotel non trovato.");
  } else {
    const taxiCompany = await prisma.taxiCompany.findUnique({ where: { id: data.orgId } });
    if (!taxiCompany) throw new Error("Compagnia taxi non trovata.");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: data.name,
      role: data.orgType === "HOTEL" ? ROLES.HOTEL_STAFF : ROLES.TAXI_STAFF,
      hotelId: data.orgType === "HOTEL" ? data.orgId : null,
      taxiCompanyId: data.orgType === "TAXI" ? data.orgId : null,
      isOrgAdmin: data.isOrgAdmin,
    },
  });

  revalidatePath("/admin/operatori");
}

export async function createAdminUser(formData: FormData) {
  await requireAdmin();
  const parsed = createAdminUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");
  const data = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new Error("Email già in uso.");

  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: { email: data.email, passwordHash, name: data.name, role: ROLES.ADMIN },
  });

  revalidatePath("/admin/impostazioni");
}
