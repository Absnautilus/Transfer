import { z } from "zod";

export const guestRequestSchema = z.object({
  guestFirstName: z.string().trim().min(1, "Inserisci il nome"),
  guestLastName: z.string().trim().min(1, "Inserisci il cognome"),
  guestEmail: z.string().trim().email("Email non valida"),
  guestPhone: z.string().trim().min(5, "Inserisci un numero di telefono valido"),
  roomNumber: z.string().trim().optional(),
  bookingNumber: z.string().trim().optional(),
  pax: z.coerce.number().int().min(1, "Almeno 1 passeggero").max(50),
  bagsPersonal: z.coerce.number().int().min(0).max(20).optional().default(0),
  bagsCabin: z.coerce.number().int().min(0).max(20).optional().default(0),
  bagsStandard: z.coerce.number().int().min(0).max(20).optional().default(0),
  bagsLarge: z.coerce.number().int().min(0).max(20).optional().default(0),
  date: z.string().min(1, "Seleziona una data"),
  time: z.string().min(1, "Seleziona un orario"),
  routeOptionId: z.string().trim().min(1, "Seleziona punto e modalità di transfer"),
  direction: z.enum(["ARRIVO", "PARTENZA"], { message: "Seleziona la direzione del transfer" }),
  arrivalMode: z.enum(["AEREO", "TRENO", "NAVE", "AUTO", "AUTOBUS"]).optional(),
  estimatedArrivalTime: z.string().trim().optional(),
  flightOrTrainNumber: z.string().trim().optional(),
  flightOrTrainOrigin: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  locale: z.enum(["it", "en", "es", "pt", "fr", "de"]).optional().default("it"),
});

export type GuestRequestInput = z.infer<typeof guestRequestSchema>;

export const rejectRequestSchema = z.object({
  requestId: z.string().min(1),
  reason: z.string().trim().min(3, "Spiega il motivo del rifiuto"),
});

export const manualTransferSchema = z.object({
  transferId: z.string().optional(),
  guestFirstName: z.string().trim().min(1, "Inserisci il nome"),
  guestLastName: z.string().trim().min(1, "Inserisci il cognome"),
  guestEmail: z.string().trim().email().optional().or(z.literal("")),
  guestPhone: z.string().trim().optional(),
  roomNumber: z.string().trim().optional(),
  bookingNumber: z.string().trim().optional(),
  pax: z.coerce.number().int().min(1).max(50),
  bagsPersonal: z.coerce.number().int().min(0).max(20).optional().default(0),
  bagsCabin: z.coerce.number().int().min(0).max(20).optional().default(0),
  bagsStandard: z.coerce.number().int().min(0).max(20).optional().default(0),
  bagsLarge: z.coerce.number().int().min(0).max(20).optional().default(0),
  date: z.string().min(1),
  time: z.string().min(1),
  routeFrom: z.string().trim().min(1, "Indica il punto di partenza"),
  routeTo: z.string().trim().min(1, "Indica il punto di arrivo"),
  flightOrTrainNumber: z.string().trim().optional(),
  flightOrTrainOrigin: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  price: z.coerce.number().min(0, "La tariffa non può essere negativa").optional(),
  priceAdjustmentType: z.enum(["NONE", "DISCOUNT", "SURCHARGE"]).optional().default("NONE"),
  priceAdjustmentAmount: z.coerce.number().min(0).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const createHotelSchema = z.object({
  name: z.string().trim().min(2, "Indica il nome dell'hotel"),
  slug: z
    .string()
    .trim()
    .min(2, "Indica uno slug")
    .regex(/^[a-z0-9-]+$/, "Usa solo lettere minuscole, numeri e trattini"),
  address: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  primaryTaxiCompanyId: z.string().trim().optional(),
});

export const createTaxiCompanySchema = z.object({
  name: z.string().trim().min(2, "Indica il nome della compagnia"),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  commissionRate: z.coerce.number().min(0).max(100).optional(),
});

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(2, "Indica il nome"),
  email: z.string().trim().email(),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
});

export const createOperatorSchema = z.object({
  orgType: z.enum(["HOTEL", "TAXI"], { message: "Seleziona il tipo di organizzazione" }),
  orgId: z.string().trim().min(1, "Seleziona l'organizzazione"),
  name: z.string().trim().min(2, "Indica il nome"),
  // Not required to be a real email: just a unique login identifier. Admins
  // can enter a plain username now, or a real email later — same field.
  email: z
    .string()
    .trim()
    .min(3, "Indica un nome utente di almeno 3 caratteri")
    .regex(/^\S+$/, "Il nome utente non può contenere spazi"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
  isOrgAdmin: z.coerce.boolean().optional().default(false),
});
