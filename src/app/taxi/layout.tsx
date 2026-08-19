import { requireTaxiUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";

const NAV = [
  { href: "/taxi/transfer", label: "Transfer" },
  { href: "/taxi/autisti", label: "Autisti" },
];

export default async function TaxiLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTaxiUser();
  const taxiCompany = await prisma.taxiCompany.findUnique({ where: { id: user.taxiCompanyId } });

  return (
    <DashboardShell title="Dashboard Taxi" orgName={taxiCompany?.name ?? "Compagnia Taxi"} userName={user.name ?? user.email ?? ""} nav={NAV}>
      {children}
    </DashboardShell>
  );
}
