import { requireAdmin } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard-shell";

const NAV = [
  { href: "/admin", label: "Panoramica" },
  { href: "/admin/hotels", label: "Hotel" },
  { href: "/admin/taxi-companies", label: "Compagnie taxi" },
  { href: "/admin/operatori", label: "Operatori" },
  { href: "/admin/impostazioni", label: "Impostazioni" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <DashboardShell title="Amministrazione" orgName="Piattaforma" userName={user.name ?? user.email ?? ""} userId={user.id} nav={NAV}>
      {children}
    </DashboardShell>
  );
}
