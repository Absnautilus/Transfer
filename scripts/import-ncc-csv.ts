// One-off importer for a historical "NCC Plan" CSV export (see prisma/schema.prisma
// for the Transfer model this maps onto). Run locally only:
//
//   npm run import:csv -- /absolute/path/to/plan.csv [hotel-slug]
//
// The CSV path is never committed and this script contains no guest data itself,
// so it's safe to keep in the repo. Output only ever goes to whatever database
// DATABASE_URL points at (point it at a local/dev database, never production).
import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { parseCsv, csvRowsToObjects } from "./parse-csv";
import { parseItalianDate, parseDotTime, parseBool, parsePrice, splitRoute } from "./ncc-mapping";
import { TRANSFER_STATUS } from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CSV_COL = {
  cxl: "CXL",
  cam: "CAM",
  evaso: "EVASO",
  data: "DATA",
  res: "RES",
  nominativo: "NOMINATIVO",
  pax: "PAX",
  bags: "BAGS",
  ora: "ORA",
  nt: "NT",
  tratta: "TRATTA",
  extra: "EXTRA",
  volo: "VOLO // TRENO",
  provenienza: "PROVENIENZA VOLO // TRENO",
  telefono: "TELEFONO CLIENTE",
  note: "NOTE",
  sigla: "SIGLA OPERATORE",
  tariffa: "TARIFFA TOTALE",
  conf: "CONF",
  autista: "AUTISTA",
  noteVettore: "NOTE VETTORE",
};

function parseSubmittedAt(value: string): Date | undefined {
  const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2})\.(\d{2})\.(\d{2})$/);
  if (!m) return undefined;
  const [, dd, mm, yyyy, hh, min, ss] = m;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function main() {
  const csvPath = process.argv[2];
  const hotelSlug = process.argv[3] ?? "palazzo-veneziano";
  if (!csvPath) {
    console.error("Uso: tsx scripts/import-ncc-csv.ts <path-to-csv> [hotel-slug]");
    process.exit(1);
  }

  const hotel = await prisma.hotel.findUnique({ where: { slug: hotelSlug } });
  if (!hotel) {
    console.error(`Hotel con slug "${hotelSlug}" non trovato. Esegui prima "npm run db:seed".`);
    process.exit(1);
  }
  const taxiCompanyId = hotel.primaryTaxiCompanyId;

  const text = readFileSync(csvPath, "utf-8");
  const rows = csvRowsToObjects(parseCsv(text));
  console.log(`Righe totali nel CSV: ${rows.length}`);

  const driverCache = new Map<string, string>();
  async function driverIdFor(name: string): Promise<string | null> {
    const trimmed = name.trim();
    if (!trimmed || !taxiCompanyId) return null;
    if (driverCache.has(trimmed)) return driverCache.get(trimmed)!;
    let driver = await prisma.driver.findFirst({ where: { taxiCompanyId, name: trimmed } });
    if (!driver) {
      driver = await prisma.driver.create({ data: { taxiCompanyId, name: trimmed, phone: "" } });
    }
    driverCache.set(trimmed, driver.id);
    return driver.id;
  }

  let imported = 0;
  let skipped = 0;
  const batch: Prisma.TransferCreateManyInput[] = [];

  for (const row of rows) {
    const date = parseItalianDate(row[CSV_COL.data] ?? "");
    const guestName = (row[CSV_COL.nominativo] ?? "").trim();
    if (!date || !guestName) {
      skipped++;
      continue;
    }

    const cancelled = parseBool(row[CSV_COL.cxl] ?? "");
    const completed = parseBool(row[CSV_COL.evaso] ?? "");
    const confirmedByTaxi = parseBool(row[CSV_COL.conf] ?? "");
    const autista = (row[CSV_COL.autista] ?? "").trim();

    let status: string = TRANSFER_STATUS.AWAITING_TAXI;
    if (cancelled) status = TRANSFER_STATUS.CANCELLED;
    else if (completed) status = TRANSFER_STATUS.COMPLETED;
    else if (autista && confirmedByTaxi) status = TRANSFER_STATUS.ASSIGNED;
    else if (confirmedByTaxi) status = TRANSFER_STATUS.CONFIRMED;

    const rawRoute = row[CSV_COL.tratta]?.trim() || row[CSV_COL.extra]?.trim() || "";
    const [routeFrom, routeTo] = rawRoute ? splitRoute(rawRoute) : ["N/D", "N/D"];

    const notesParts = [row[CSV_COL.note], row[CSV_COL.noteVettore]].map((s) => s?.trim()).filter(Boolean);

    const driverId = autista ? await driverIdFor(autista) : null;

    batch.push({
      hotelId: hotel.id,
      taxiCompanyId,
      driverId,
      status,
      guestName,
      guestPhone: row[CSV_COL.telefono]?.trim() || null,
      roomNumber: row[CSV_COL.cam]?.trim() || null,
      bookingNumber: row[CSV_COL.res]?.trim() || null,
      pax: Number.parseInt(row[CSV_COL.pax] ?? "1", 10) || 1,
      bags: row[CSV_COL.bags]?.trim() || null,
      date,
      time: parseDotTime(row[CSV_COL.ora] ?? ""),
      isNightService: (row[CSV_COL.nt] ?? "").trim().toLowerCase().startsWith("s"),
      routeFrom: routeFrom || "N/D",
      routeTo: routeTo || "N/D",
      flightOrTrainNumber: row[CSV_COL.volo]?.trim() || null,
      flightOrTrainOrigin: row[CSV_COL.provenienza]?.trim() || null,
      notes: notesParts.length > 0 ? notesParts.join(" — ") : null,
      price: parsePrice(row[CSV_COL.tariffa] ?? ""),
      operatorInitials: row[CSV_COL.sigla]?.trim() || null,
      createdAt: parseSubmittedAt(row["Informazioni cronologiche"] ?? ""),
    });
    imported++;
  }

  const BATCH_SIZE = 300;
  for (let i = 0; i < batch.length; i += BATCH_SIZE) {
    const chunk = batch.slice(i, i + BATCH_SIZE);
    await prisma.transfer.createMany({ data: chunk });
    console.log(`Importate ${Math.min(i + BATCH_SIZE, batch.length)} / ${batch.length}`);
  }

  console.log(`\nCompletato. Importati: ${imported}. Righe saltate (intestazioni/vuote): ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
