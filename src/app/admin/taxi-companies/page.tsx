import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { TaxiCompanyForm } from "./taxi-company-form";
import { deleteTaxiCompany } from "../actions";

export default async function AdminTaxiCompaniesPage() {
  await requireAdmin();
  const taxiCompanies = await prisma.taxiCompany.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true, drivers: true, transfers: true } } },
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Compagnie taxi</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Nuova compagnia</h2>
        </CardHeader>
        <CardBody>
          <TaxiCompanyForm />
        </CardBody>
      </Card>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Provvigione</th>
              <th className="px-4 py-2">Utenti</th>
              <th className="px-4 py-2">Autisti</th>
              <th className="px-4 py-2">Transfer</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {taxiCompanies.map((tc) => (
              <tr key={tc.id}>
                <td className="px-4 py-2 font-medium text-slate-900">{tc.name}</td>
                <td className="px-4 py-2 text-slate-600">{tc.commissionRate != null ? `${tc.commissionRate}%` : "—"}</td>
                <td className="px-4 py-2 text-slate-600">{tc._count.users}</td>
                <td className="px-4 py-2 text-slate-600">{tc._count.drivers}</td>
                <td className="px-4 py-2 text-slate-600">{tc._count.transfers}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/taxi-companies/${tc.id}`}>
                      <span className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                        Modifica
                      </span>
                    </Link>
                    <ConfirmButton
                      label="Elimina"
                      title={`Eliminare "${tc.name}"?`}
                      description="Verranno eliminati anche gli autisti e gli account operatore di questa compagnia. I transfer collegati restano ma senza compagnia assegnata. L'azione è irreversibile."
                      confirmLabel="Elimina definitivamente"
                      onConfirm={deleteTaxiCompany.bind(null, tc.id)}
                    />
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
