"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { REQUEST_STATUS } from "@/lib/constants";
import { toGuestStatusBucket, type GuestStatusBucket } from "@/lib/guest-status";

const lookupSchema = z.object({
  email: z.string().trim().email(),
  surname: z.string().trim().min(2),
});

export type MyTransfer = {
  id: string;
  statusBucket: GuestStatusBucket;
  date: string;
  time: string;
  routeFrom: string;
  routeTo: string;
  pax: number;
  bagsPersonal: number;
  bagsCabin: number;
  bagsStandard: number;
  bagsLarge: number;
  flightOrTrainNumber: string | null;
  flightOrTrainOrigin: string | null;
  notes: string | null;
  price: number | null;
  guestTrackingToken: string;
};

export type MyRequest = {
  id: string;
  status: string;
  date: string;
  time: string;
  routeFrom: string;
  routeTo: string;
  pax: number;
  bagsPersonal: number;
  bagsCabin: number;
  bagsStandard: number;
  bagsLarge: number;
  flightOrTrainNumber: string | null;
  flightOrTrainOrigin: string | null;
  notes: string | null;
  quotedPrice: number | null;
  rejectionReason: string | null;
};

export type LookupResult = { ok: true; transfers: MyTransfer[]; requests: MyRequest[] } | { ok: false; error: string };

export async function lookupMyTransfers(formData: FormData): Promise<LookupResult> {
  const parsed = lookupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }
  const { email, surname } = parsed.data;

  const [transfers, requests] = await Promise.all([
    prisma.transfer.findMany({
      where: {
        guestEmail: { equals: email, mode: "insensitive" },
        guestLastName: { contains: surname, mode: "insensitive" },
      },
      orderBy: [{ date: "desc" }, { time: "desc" }],
      take: 20,
    }),
    prisma.transferRequest.findMany({
      where: {
        guestEmail: { equals: email, mode: "insensitive" },
        guestLastName: { contains: surname, mode: "insensitive" },
        status: { not: REQUEST_STATUS.ACCEPTED },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    ok: true,
    transfers: transfers.map((t) => ({
      id: t.id,
      statusBucket: toGuestStatusBucket(t.status),
      date: t.date,
      time: t.time,
      routeFrom: t.routeFrom,
      routeTo: t.routeTo,
      pax: t.pax,
      bagsPersonal: t.bagsPersonal,
      bagsCabin: t.bagsCabin,
      bagsStandard: t.bagsStandard,
      bagsLarge: t.bagsLarge,
      flightOrTrainNumber: t.flightOrTrainNumber,
      flightOrTrainOrigin: t.flightOrTrainOrigin,
      notes: t.notes,
      price: t.price,
      guestTrackingToken: t.guestTrackingToken,
    })),
    requests: requests.map((r) => ({
      id: r.id,
      status: r.status,
      date: r.date,
      time: r.time,
      routeFrom: r.routeFrom,
      routeTo: r.routeTo,
      pax: r.pax,
      bagsPersonal: r.bagsPersonal,
      bagsCabin: r.bagsCabin,
      bagsStandard: r.bagsStandard,
      bagsLarge: r.bagsLarge,
      flightOrTrainNumber: r.flightOrTrainNumber,
      flightOrTrainOrigin: r.flightOrTrainOrigin,
      notes: r.notes,
      quotedPrice: r.quotedPrice,
      rejectionReason: r.rejectionReason,
    })),
  };
}
