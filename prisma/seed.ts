// Demo seed data — fictional guests/bookings only, safe to commit.
// For importing real historical bookings from a CSV export, use
// `npm run import:csv -- /path/to/file.csv` (see scripts/import-ncc-csv.ts);
// that data is never written into this file or into git.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ROLES, TRANSFER_STATUS, TRIP_EVENT } from "../src/lib/constants";
import { format, addDays } from "date-fns";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const taxiCompany = await prisma.taxiCompany.upsert({
    where: { id: "demo-taxi-company" },
    update: {},
    create: {
      id: "demo-taxi-company",
      name: "Venezia Transfer NCC",
      email: "operativo@veneziatransfer.demo",
      phone: "+39 041 000000",
    },
  });

  const hotel = await prisma.hotel.upsert({
    where: { slug: "palazzo-veneziano" },
    update: { primaryTaxiCompanyId: taxiCompany.id },
    create: {
      name: "Hotel Palazzo Veneziano",
      slug: "palazzo-veneziano",
      address: "Venezia, Italia",
      email: "reception@palazzoveneziano.demo",
      phone: "+39 041 111111",
      primaryTaxiCompanyId: taxiCompany.id,
    },
  });

  const routeSeed = [
    {
      pointLabel: "Aeroporto Marco Polo (VCE)",
      transferMode: "Auto privata",
      description:
        "Il suo autista la attenderà in arrivi dopo il ritiro bagagli e la accompagnerà con un'auto di lusso fino al terminal San Basilio, dove il nostro bellboy la aiuterà con i bagagli fino al check-in.",
      durationMinutes: 20,
      priceTiers: { day: { "1-4": 95, "5": 105, "6": 110, "7": 115, "8": 120 }, night: { "1-4": 105, "5": 115, "6": 120, "7": 125, "8": 130 } },
    },
    {
      pointLabel: "Aeroporto Marco Polo (VCE)",
      transferMode: "Auto privata + Taxi acqueo",
      description:
        "Il suo autista la attenderà in arrivi e la accompagnerà in auto fino a Piazzale Roma, dove un taxi acqueo privato la condurrà fino al pontile davanti all'hotel.",
      durationMinutes: 35,
      priceTiers: { day: { "1-4": 155, "5": 165, "6": 170, "7": 180, "8": 190 }, night: { "1-4": 165, "5": 175, "6": 180, "7": 190, "8": 200 } },
    },
    {
      pointLabel: "Aeroporto Marco Polo (VCE)",
      transferMode: "Taxi acqueo privato",
      description:
        "Il suo autista la attenderà in arrivi e la accompagnerà fino al gate acqueo dell'aeroporto, dove troverà il suo taxi acqueo privato per un'esclusiva navigazione nella laguna fino al pontile privato dell'hotel.",
      durationMinutes: 40,
      priceTiers: { day: { "1-4": 235, "5": 255, "6": 275, "7": 295, "8": 315 }, night: { "1-4": 245, "5": 265, "6": 285, "7": 305, "8": 325 } },
    },
    {
      pointLabel: "Stazione Santa Lucia",
      transferMode: null,
      description: "Transfer privato in auto dalla stazione ferroviaria di Venezia Santa Lucia fino all'hotel.",
      durationMinutes: 20,
      priceTiers: { day: { "1-4": 160, "5": 170, "6": 175, "7": 180, "8": 185 }, night: { "1-4": 170, "5": 180, "6": 185, "7": 190, "8": 195 } },
    },
  ];
  for (const [i, r] of routeSeed.entries()) {
    const existing = await prisma.hotelRoute.findFirst({ where: { hotelId: hotel.id, pointLabel: r.pointLabel, transferMode: r.transferMode } });
    if (!existing) {
      await prisma.hotelRoute.create({
        data: {
          hotelId: hotel.id,
          pointLabel: r.pointLabel,
          transferMode: r.transferMode,
          description: r.description,
          durationMinutes: r.durationMinutes,
          priceTiers: r.priceTiers,
          sortOrder: i,
        },
      });
    }
  }
  const seededRoutes = await prisma.hotelRoute.findMany({ where: { hotelId: hotel.id } });
  const airportCarRoute = seededRoutes.find((r) => r.pointLabel === "Aeroporto Marco Polo (VCE)" && r.transferMode === "Auto privata")!;
  const airportCarBoatRoute = seededRoutes.find(
    (r) => r.pointLabel === "Aeroporto Marco Polo (VCE)" && r.transferMode === "Auto privata + Taxi acqueo",
  )!;
  const stationRoute = seededRoutes.find((r) => r.pointLabel === "Stazione Santa Lucia")!;

  await prisma.user.upsert({
    where: { email: "hotel@demo.local" },
    update: {},
    create: {
      email: "hotel@demo.local",
      passwordHash,
      name: "Reception Palazzo Veneziano",
      role: ROLES.HOTEL_STAFF,
      hotelId: hotel.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "taxi@demo.local" },
    update: {},
    create: {
      email: "taxi@demo.local",
      passwordHash,
      name: "Centrale Venezia Transfer",
      role: ROLES.TAXI_STAFF,
      taxiCompanyId: taxiCompany.id,
    },
  });

  const driverNames = [
    { name: "Marco Bianchi", phone: "+39 333 1000001" },
    { name: "Luca Ferrari", phone: "+39 333 1000002" },
  ];
  const drivers = [];
  for (const d of driverNames) {
    let driver = await prisma.driver.findFirst({ where: { taxiCompanyId: taxiCompany.id, name: d.name } });
    if (!driver) {
      driver = await prisma.driver.create({ data: { taxiCompanyId: taxiCompany.id, name: d.name, phone: d.phone, vehicleInfo: "Mercedes Classe V" } });
    }
    drivers.push(driver);

    const driverEmail = `${d.name.toLowerCase().replace(/\s+/g, ".")}@demo.local`;
    await prisma.user.upsert({
      where: { email: driverEmail },
      update: {},
      create: {
        email: driverEmail,
        passwordHash,
        name: d.name,
        role: ROLES.DRIVER,
        phone: d.phone,
        taxiCompanyId: taxiCompany.id,
        driverId: driver.id,
      },
    });
  }

  const today = format(new Date(), "yyyy-MM-dd");

  const existingRequests = await prisma.transferRequest.count({ where: { hotelId: hotel.id } });
  if (existingRequests === 0) {
    await prisma.transferRequest.createMany({
      data: [
        {
          hotelId: hotel.id,
          guestName: "Sophie Dubois",
          guestEmail: "sophie.dubois@example.com",
          guestPhone: "+33 6 12 34 56 78",
          roomNumber: "204",
          bookingNumber: "BK-2041",
          pax: 2,
          bagsStandard: 2,
          date: today,
          time: "16:30",
          routeOptionId: airportCarRoute.id,
          routeFrom: "Aeroporto Marco Polo (VCE)",
          routeTo: hotel.name,
          quotedPrice: 95,
          flightOrTrainNumber: "AF1234",
          flightOrTrainOrigin: "Parigi",
          notes: "Volo in leggero ritardo, confermeremo orario esatto.",
        },
        {
          hotelId: hotel.id,
          guestName: "James Whitfield",
          guestEmail: "james.whitfield@example.com",
          guestPhone: "+44 7700 900123",
          roomNumber: "112",
          bookingNumber: "BK-2055",
          pax: 4,
          bagsStandard: 4,
          bagsCabin: 1,
          date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
          time: "09:15",
          routeOptionId: airportCarRoute.id,
          routeFrom: hotel.name,
          routeTo: "Aeroporto Marco Polo (VCE)",
          quotedPrice: 95,
          flightOrTrainNumber: "BA562",
          flightOrTrainOrigin: "Londra",
        },
      ],
    });
  }

  const existingTransfers = await prisma.transfer.count({ where: { hotelId: hotel.id } });
  if (existingTransfers === 0) {
    const t1 = await prisma.transfer.create({
      data: {
        hotelId: hotel.id,
        taxiCompanyId: taxiCompany.id,
        status: TRANSFER_STATUS.AWAITING_TAXI,
        guestName: "Elena Kowalski",
        guestEmail: "elena.kowalski@example.com",
        guestPhone: "+48 600 123 456",
        roomNumber: "301",
        bookingNumber: "BK-1987",
        pax: 2,
        bags: "2 valigie",
        date: today,
        time: "11:00",
        routeOptionId: airportCarRoute.id,
        routeFrom: hotel.name,
        routeTo: "Aeroporto Marco Polo (VCE)",
        flightOrTrainNumber: "LO321",
        flightOrTrainOrigin: "Varsavia",
        price: 95,
      },
    });

    await prisma.transfer.create({
      data: {
        hotelId: hotel.id,
        taxiCompanyId: taxiCompany.id,
        status: TRANSFER_STATUS.CONFIRMED,
        guestName: "The Anderson Family",
        guestEmail: "anderson.family@example.com",
        guestPhone: "+1 415 555 0134",
        roomNumber: "410",
        bookingNumber: "BK-2002",
        pax: 5,
        bags: "5 valigie",
        date: today,
        time: "14:45",
        routeOptionId: airportCarBoatRoute.id,
        routeFrom: "Aeroporto Marco Polo (VCE)",
        routeTo: hotel.name,
        flightOrTrainNumber: "UA890",
        flightOrTrainOrigin: "Newark",
        price: 165,
      },
    });

    const t3 = await prisma.transfer.create({
      data: {
        hotelId: hotel.id,
        taxiCompanyId: taxiCompany.id,
        status: TRANSFER_STATUS.ASSIGNED,
        driverId: drivers[0].id,
        guestName: "Marco Conti",
        guestEmail: "marco.conti@example.com",
        guestPhone: "+39 335 1234567",
        roomNumber: "205",
        bookingNumber: "BK-1955",
        pax: 1,
        date: today,
        time: "18:20",
        routeOptionId: stationRoute.id,
        routeFrom: "Stazione Santa Lucia",
        routeTo: hotel.name,
        flightOrTrainNumber: "ITALO 8906",
        price: 160,
      },
    });
    await prisma.tripStatusEvent.create({ data: { transferId: t3.id, status: TRIP_EVENT.ASSIGNED, note: `Assegnato a ${drivers[0].name}` } });

    const t4 = await prisma.transfer.create({
      data: {
        hotelId: hotel.id,
        taxiCompanyId: taxiCompany.id,
        status: TRANSFER_STATUS.IN_PROGRESS,
        driverId: drivers[1].id,
        guestName: "Yuki Tanaka",
        guestEmail: "yuki.tanaka@example.com",
        guestPhone: "+81 90 1234 5678",
        roomNumber: "118",
        bookingNumber: "BK-1899",
        pax: 2,
        date: today,
        time: "07:30",
        routeOptionId: airportCarRoute.id,
        routeFrom: hotel.name,
        routeTo: "Aeroporto Marco Polo (VCE)",
        price: 95,
        tripStartedAt: new Date(),
      },
    });
    await prisma.tripStatusEvent.createMany({
      data: [
        { transferId: t4.id, status: TRIP_EVENT.ASSIGNED, note: `Assegnato a ${drivers[1].name}` },
        { transferId: t4.id, status: TRIP_EVENT.EN_ROUTE },
        { transferId: t4.id, status: TRIP_EVENT.ARRIVED },
        { transferId: t4.id, status: TRIP_EVENT.STARTED },
      ],
    });

    console.log("Link tracciamento ospite di esempio:");
    console.log(`  /traccia/${t1.guestTrackingToken}`);
    console.log(`  /traccia/${t4.guestTrackingToken}`);
  }

  console.log("\nSeed completato.");
  console.log("Accessi demo (password: password123):");
  console.log("  Hotel: hotel@demo.local");
  console.log("  Taxi:  taxi@demo.local");
  console.log("  Autista: marco.bianchi@demo.local");
  console.log(`\nQuestionario ospite: /richiedi/${hotel.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
