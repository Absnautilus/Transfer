import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { ROLE_LABEL, ROLES, type Role } from "@/lib/constants";
import { OperatorForm } from "./operator-form";
import { deleteUser } from "../actions";

export default async function AdminOperatorsPage() {
  const admin = await requireAdmin();

  const [hotels, taxiCompanies, users] = await Promise.all([
    prisma.hotel.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.taxiCompany.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
      include: { hotel: { select: { name: true } }, taxiCompany: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Utenti</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Nuovo operatore</h2>
        </CardHeader>
        <CardBody>
          <OperatorForm hotels={hotels} taxiCompanies={taxiCompanies} />
        </CardBody>
      </Card>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Nome utente</th>
              <th className="px-4 py-2">Ruolo</th>
              <th className="px-4 py-2">Organizzazione</th>
              <th className="px-4 py-2">Admin</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-2 text-slate-500">{u.email}</td>
                <td className="px-4 py-2 text-slate-600">{ROLE_LABEL[u.role as Role] ?? u.role}</td>
                <td className="px-4 py-2 text-slate-600">{u.hotel?.name ?? u.taxiCompany?.name ?? "—"}</td>
                <td className="px-4 py-2">
                  {u.role === ROLES.HOTEL_STAFF || u.role === ROLES.TAXI_STAFF ? (
                    <span className={u.isOrgAdmin ? "text-emerald-600" : "text-slate-400"}>{u.isOrgAdmin ? "Sì" : "No"}</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/operatori/${u.id}`}>
                      <span className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                        Modifica
                      </span>
                    </Link>
                    {u.id !== admin.id && (
                      <ConfirmButton
                        label="Elimina"
                        title={`Eliminare l'account di "${u.name}"?`}
                        description="L'utente perderà l'accesso immediatamente. L'azione è irreversibile."
                        confirmLabel="Elimina definitivamente"
                        onConfirm={deleteUser.bind(null, u.id)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
