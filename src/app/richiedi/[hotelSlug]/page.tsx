import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PublicHeader } from "@/components/public-header";
import { RequestForm } from "./request-form";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionaries";

export default async function GuestRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ hotelSlug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { hotelSlug } = await params;
  const { lang } = await searchParams;
  const locale = await getRequestLocale(lang);
  const dict = t(locale).guestForm;

  const hotel = await prisma.hotel.findUnique({
    where: { slug: hotelSlug },
    include: { routes: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
  });

  if (!hotel) notFound();

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <PublicHeader locale={locale} />
      <div className="mx-auto max-w-xl px-4 pt-4">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-slate-500">{hotel.name}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{dict.pageTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{dict.pageSubtitle}</p>
        </div>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-700">{dict.sectionDetails}</h2>
          </CardHeader>
          <CardBody>
            <RequestForm
              hotelSlug={hotel.slug}
              hotelName={hotel.name}
              locale={locale}
              routes={hotel.routes.map((r) => ({
                id: r.id,
                pointLabel: r.pointLabel,
                pointCategory: r.pointCategory,
                transferMode: r.transferMode,
                descriptionArrival: r.descriptionArrival,
                descriptionDeparture: r.descriptionDeparture,
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
