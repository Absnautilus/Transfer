import { requireAdmin } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard-shell";

const NAV = [
  { href: "/admin", label: "Panoramica", icon: "home" },
  { href: "/admin/hotels", label: "Hotel", icon: "building" },
  { href: "/admin/taxi-companies", label: "Compagnie taxi", icon: "car" },
  { href: "/admin/operatori", label: "Utenti", icon: "users" },
  { href: "/admin/impostazioni", label: "Impostazioni", icon: "settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <DashboardShell
      title="Amministrazione"
      orgName="Piattaforma"
      userName={user.name ?? user.email ?? ""}
      userRoleLabel="Master"
      userId={user.id}
      nav={NAV}
    >
      {children}
    </DashboardShell>
  );
}
