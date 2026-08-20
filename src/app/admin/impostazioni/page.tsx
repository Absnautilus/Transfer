import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ROLES } from "@/lib/constants";
import { AdminUserForm } from "./admin-user-form";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const admins = await prisma.user.findMany({ where: { role: ROLES.ADMIN }, orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Impostazioni</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Amministratori piattaforma</h2>
        </CardHeader>
        <CardBody>
          <p className="mb-3 text-sm text-slate-500">
            Gli amministratori hanno accesso a tutti gli hotel e le compagnie taxi registrati, non solo alla propria
            organizzazione.
          </p>
          <ul className="mb-4 space-y-1 text-sm text-slate-700">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center gap-2">
                <span className="font-medium">{a.name}</span>
                <span className="text-slate-400">{a.email}</span>
              </li>
            ))}
          </ul>
          <AdminUserForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">App</h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-slate-500">
            Nome, lingue supportate e colori sono configurati a livello di codice (non ancora editabili da qui). Il backup dati è
            disponibile dalla sezione Team di ogni hotel/compagnia taxi.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
