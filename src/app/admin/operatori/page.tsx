import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ROLE_LABEL, ROLES, type Role } from "@/lib/constants";
import { OperatorForm } from "./operator-form";

export default async function AdminOperatorsPage() {
  await requireAdmin();

  const [hotels, taxiCompanies, operators] = await Promise.all([
    prisma.hotel.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.taxiCompany.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.user.findMany({
      where: { role: { in: [ROLES.HOTEL_STAFF, ROLES.TAXI_STAFF] } },
      orderBy: { name: "asc" },
      include: { hotel: { select: { name: true } }, taxiCompany: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Operatori</h1>

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
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Ruolo</th>
              <th className="px-4 py-2">Organizzazione</th>
              <th className="px-4 py-2">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {operators.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-2 font-medium text-slate-900">{o.name}</td>
                <td className="px-4 py-2 text-slate-500">{o.email}</td>
                <td className="px-4 py-2 text-slate-600">{ROLE_LABEL[o.role as Role] ?? o.role}</td>
                <td className="px-4 py-2 text-slate-600">{o.hotel?.name ?? o.taxiCompany?.name ?? "—"}</td>
                <td className="px-4 py-2">
                  <span className={o.isOrgAdmin ? "text-emerald-600" : "text-slate-400"}>{o.isOrgAdmin ? "Sì" : "No"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
