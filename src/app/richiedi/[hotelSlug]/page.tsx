import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PublicHeader } from "@/components/public-header";
import { RequestForm } from "./request-form";

export default async function GuestRequestPage({ params }: { params: Promise<{ hotelSlug: string }> }) {
  const { hotelSlug } = await params;
  const hotel = await prisma.hotel.findUnique({
    where: { slug: hotelSlug },
    include: { routes: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
  });

  if (!hotel) notFound();

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <PublicHeader />
      <div className="mx-auto max-w-xl px-4 pt-4">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-slate-500">{hotel.name}</p>
          <h1 className="text-2xl font-semibold text-slate-900">Richiesta transfer</h1>
          <p className="mt-1 text-sm text-slate-500">
            Compili il modulo con i dettagli del suo transfer. Riceverà una email di conferma appena la richiesta sarà verificata dal nostro staff.
          </p>
        </div>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-700">Dettagli transfer</h2>
          </CardHeader>
          <CardBody>
            <RequestForm
              hotelSlug={hotel.slug}
              hotelName={hotel.name}
              routes={hotel.routes.map((r) => ({
                id: r.id,
                pointLabel: r.pointLabel,
                transferMode: r.transferMode,
                description: r.description,
                durationMinutes: r.durationMinutes,
                priceTiers: r.priceTiers,
              }))}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
