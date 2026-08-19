import { requireHotelUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";

const NAV = [
  { href: "/hotel/richieste", label: "Richieste" },
  { href: "/hotel/transfer", label: "Transfer" },
  { href: "/hotel/tratte", label: "Tratte" },
];

export default async function HotelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireHotelUser();
  const hotel = await prisma.hotel.findUnique({ where: { id: user.hotelId } });

  return (
    <DashboardShell title="Dashboard Hotel" orgName={hotel?.name ?? "Hotel"} userName={user.name ?? user.email ?? ""} nav={NAV}>
      {children}
    </DashboardShell>
  );
}
