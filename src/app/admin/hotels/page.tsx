import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { HotelForm } from "./hotel-form";
import { deleteHotel } from "../actions";

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
              <th className="px-4 py-2"></th>
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
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/hotels/${h.id}`}>
                      <span className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                        Modifica
                      </span>
                    </Link>
                    <ConfirmButton
                      label="Elimina"
                      title={`Eliminare "${h.name}"?`}
                      description="Verranno eliminati anche tutte le tratte, le richieste, i transfer e gli account operatore di questo hotel. L'azione è irreversibile."
                      confirmLabel="Elimina definitivamente"
                      onConfirm={deleteHotel.bind(null, h.id)}
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
