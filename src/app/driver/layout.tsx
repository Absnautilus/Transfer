import { requireDriverUser } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const user = await requireDriverUser();

  return (
    <DashboardShell
      title="Autista"
      orgName={user.name ?? "Autista"}
      userName={user.name ?? user.email ?? ""}
      userRoleLabel="Autista"
      userId={user.id}
      nav={[{ href: "/driver", label: "I miei transfer", icon: "car" }]}
    >
      {children}
    </DashboardShell>
  );
}
