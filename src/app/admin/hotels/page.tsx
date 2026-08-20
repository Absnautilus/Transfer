import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { HotelForm } from "./hotel-form";

export default async function AdminHotelsPage() {
  await requireAdmin();
  const [hotels, taxiCompanies] = await Promise.all([
    prisma.hotel.findMany({
      orderBy: { name: "asc" },
      include: { primaryTaxiCompany: true, _count: { select: { users: true, transfers: true } } },
    }),
    prisma.taxiCompany.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Hotel</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Nuovo hotel</h2>
        </CardHeader>
        <CardBody>
          <HotelForm taxiCompanies={taxiCompanies} />
        </CardBody>
      </Card>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Compagnia taxi</th>
              <th className="px-4 py-2">Utenti</th>
              <th className="px-4 py-2">Transfer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hotels.map((h) => (
              <tr key={h.id}>
                <td className="px-4 py-2 font-medium text-slate-900">{h.name}</td>
                <td className="px-4 py-2 text-slate-500">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5">{h.slug}</code>
                </td>
                <td className="px-4 py-2 text-slate-600">{h.primaryTaxiCompany?.name ?? "—"}</td>
                <td className="px-4 py-2 text-slate-600">{h._count.users}</td>
                <td className="px-4 py-2 text-slate-600">{h._count.transfers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
