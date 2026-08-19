import { prisma } from "@/lib/prisma";
import { requireHotelUser } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { RouteForm } from "./route-form";
import { RouteRow } from "./route-row";

export default async function HotelRoutesPage() {
  const user = await requireHotelUser();
  const hotel = await prisma.hotel.findUnique({ where: { id: user.hotelId } });
  const routes = await prisma.hotelRoute.findMany({ where: { hotelId: user.hotelId }, orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Tratte standard</h1>
      <p className="mb-4 text-sm text-slate-500">
        Le tratte attive appaiono nel questionario per l&apos;ospite:{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">/richiedi/{hotel?.slug}</code>
      </p>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Nuova tratta</h2>
        </CardHeader>
        <CardBody>
          <RouteForm />
        </CardBody>
      </Card>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-2">Tratta</th>
              <th className="px-4 py-2">Prezzo</th>
              <th className="px-4 py-2">Stato</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {routes.map((r) => (
              <RouteRow key={r.id} route={r} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
