"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/session";
import { ROLES } from "@/lib/constants";
import {
  createHotelSchema,
  createTaxiCompanySchema,
  createAdminUserSchema,
  createOperatorSchema,
  updateHotelSchema,
  updateTaxiCompanySchema,
  updateUserSchema,
} from "@/lib/validations";

// Retries a write once on a transient DB connection blip (common against a
// pooled connection like Supabase's on a serverless host) instead of
// leaving a multi-step transaction's caller thinking nothing happened. If
// the retry then hits a duplicate-key error, the first attempt actually
// committed before the connection dropped — surface that plainly instead
// of a raw constraint error.
async function withDbRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new Error(
          "Il tentativo precedente potrebbe essere comunque andato a buon fine (intoppo di connessione). Controlla l'elenco prima di riprovare."
        );
      }
      const message = err instanceof Error ? err.message : String(err);
      const isTransient = /connection|ECONNRESET|terminated unexpectedly|timed out/i.test(message);
      if (!isTransient || attempt >= attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }
}

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

  await withDbRetry(() =>
    prisma.$transaction(async (tx) => {
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
    })
  );

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

  await withDbRetry(() =>
    prisma.$transaction(async (tx) => {
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
    })
  );

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

export async function updateHotel(hotelId: string, formData: FormData) {
  await requireAdmin();
  const parsed = updateHotelSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");
  const data = parsed.data;

  const existingSlug = await prisma.hotel.findUnique({ where: { slug: data.slug } });
  if (existingSlug && existingSlug.id !== hotelId) throw new Error("Slug già in uso da un altro hotel.");

  await prisma.hotel.update({
    where: { id: hotelId },
    data: {
      name: data.name,
      slug: data.slug,
      address: data.address || null,
      email: data.email || null,
      phone: data.phone || null,
      primaryTaxiCompanyId: data.primaryTaxiCompanyId || null,
    },
  });

  revalidatePath("/admin/hotels");
}

export async function deleteHotel(hotelId: string) {
  await requireAdmin();
  await withDbRetry(() =>
    prisma.$transaction(async (tx) => {
      await tx.user.deleteMany({ where: { hotelId } });
      await tx.hotel.delete({ where: { id: hotelId } });
    })
  );
  revalidatePath("/admin/hotels");
}

export async function updateTaxiCompany(taxiCompanyId: string, formData: FormData) {
  await requireAdmin();
  const parsed = updateTaxiCompanySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");
  const data = parsed.data;

  await prisma.taxiCompany.update({
    where: { id: taxiCompanyId },
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      commissionRate: data.commissionRate ?? null,
    },
  });

  revalidatePath("/admin/taxi-companies");
}

export async function deleteTaxiCompany(taxiCompanyId: string) {
  await requireAdmin();
  await withDbRetry(() =>
    prisma.$transaction(async (tx) => {
      await tx.user.deleteMany({ where: { taxiCompanyId } });
      await tx.taxiCompany.delete({ where: { id: taxiCompanyId } });
    })
  );
  revalidatePath("/admin/taxi-companies");
}

export async function updateUser(userId: string, formData: FormData) {
  await requireAdmin();
  const parsed = updateUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi.");
  const data = parsed.data;
  const email = data.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.id !== userId) throw new Error("Nome utente/email già in uso.");

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email,
      isOrgAdmin: data.isOrgAdmin,
      ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {}),
    },
  });

  revalidatePath("/admin/operatori");
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) throw new Error("Non puoi eliminare il tuo stesso account.");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/operatori");
}
