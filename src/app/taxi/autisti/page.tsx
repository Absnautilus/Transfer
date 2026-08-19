import { requireTaxiUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DriverForm } from "./driver-form";
import { DriverRow } from "./driver-row";

export default async function DriversPage() {
  const user = await requireTaxiUser();
  const drivers = await prisma.driver.findMany({ where: { taxiCompanyId: user.taxiCompanyId }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Autisti</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Aggiungi autista</h2>
        </CardHeader>
        <CardBody>
          <DriverForm />
        </CardBody>
      </Card>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Telefono</th>
              <th className="px-4 py-2">Veicolo</th>
              <th className="px-4 py-2">Stato</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drivers.map((d) => (
              <DriverRow key={d.id} driver={d} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
