import { z } from "zod";

export const guestRequestSchema = z
  .object({
    guestName: z.string().trim().min(2, "Inserisci nome e cognome"),
    guestEmail: z.string().trim().email("Email non valida"),
    guestPhone: z.string().trim().min(5, "Inserisci un numero di telefono valido"),
    roomNumber: z.string().trim().optional(),
    bookingNumber: z.string().trim().optional(),
    pax: z.coerce.number().int().min(1, "Almeno 1 passeggero").max(50),
    bags: z.string().trim().optional(),
    date: z.string().min(1, "Seleziona una data"),
    time: z.string().min(1, "Seleziona un orario"),
    isNightService: z.coerce.boolean().optional().default(false),
    routeLabel: z.string().trim().optional(),
    routeFrom: z.string().trim().optional(),
    routeTo: z.string().trim().optional(),
    flightOrTrainNumber: z.string().trim().optional(),
    flightOrTrainOrigin: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .refine((data) => data.routeLabel || (data.routeFrom && data.routeTo), {
    message: "Seleziona una tratta oppure indica partenza e arrivo",
    path: ["routeFrom"],
  });

export type GuestRequestInput = z.infer<typeof guestRequestSchema>;

export const rejectRequestSchema = z.object({
  requestId: z.string().min(1),
  reason: z.string().trim().min(3, "Spiega il motivo del rifiuto"),
});

export const manualTransferSchema = z.object({
  transferId: z.string().optional(),
  guestName: z.string().trim().min(2, "Inserisci nome e cognome"),
  guestEmail: z.string().trim().email().optional().or(z.literal("")),
  guestPhone: z.string().trim().optional(),
  roomNumber: z.string().trim().optional(),
  bookingNumber: z.string().trim().optional(),
  pax: z.coerce.number().int().min(1).max(50),
  bags: z.string().trim().optional(),
  date: z.string().min(1),
  time: z.string().min(1),
  isNightService: z.coerce.boolean().optional().default(false),
  routeFrom: z.string().trim().min(1, "Indica il punto di partenza"),
  routeTo: z.string().trim().min(1, "Indica il punto di arrivo"),
  flightOrTrainNumber: z.string().trim().optional(),
  flightOrTrainOrigin: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  price: z.coerce.number().optional(),
  operatorInitials: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
