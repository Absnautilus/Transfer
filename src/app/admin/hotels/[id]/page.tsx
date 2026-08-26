import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EditHotelForm } from "../edit-hotel-form";

export default async function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [hotel, taxiCompanies] = await Promise.all([
    prisma.hotel.findUnique({ where: { id } }),
    prisma.taxiCompany.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!hotel) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Modifica hotel</h1>
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">{hotel.name}</h2>
        </CardHeader>
        <CardBody>
          <EditHotelForm hotel={hotel} taxiCompanies={taxiCompanies} />
        </CardBody>
      </Card>
    </div>
  );
}
