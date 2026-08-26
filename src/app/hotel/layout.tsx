import { requireHotelUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";

const BASE_NAV = [
  { href: "/hotel/richieste", label: "Richieste", icon: "inbox" },
  { href: "/hotel/transfer", label: "Transfer", icon: "car" },
  { href: "/hotel/tratte", label: "Tratte", icon: "map-pin" },
];

export default async function HotelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireHotelUser();
  const hotel = await prisma.hotel.findUnique({ where: { id: user.hotelId } });
  const nav = user.isOrgAdmin
    ? [...BASE_NAV, { href: "/hotel/contabilita", label: "Contabilità", icon: "credit-card" }, { href: "/hotel/team", label: "Team", icon: "users" }]
    : BASE_NAV;

  return (
    <DashboardShell
      title="Dashboard Hotel"
      orgName={hotel?.name ?? "Hotel"}
      userName={user.name ?? user.email ?? ""}
      userRoleLabel={user.isOrgAdmin ? "Admin" : "Staff"}
      userId={user.id}
      nav={nav}
    >
      {children}
    </DashboardShell>
  );
}
