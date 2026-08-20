import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TripStatusView } from "@/components/trip-status-view";
import { AutoRefresh } from "@/components/auto-refresh";
import { PublicHeader } from "@/components/public-header";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionaries";
import { LOCALE_INTL } from "@/lib/i18n/locales";

export default async function GuestTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { token } = await params;
  const { lang } = await searchParams;
  const locale = await getRequestLocale(lang);
  const dict = t(locale).tracking;

  const transfer = await prisma.transfer.findUnique({
    where: { guestTrackingToken: token },
    include: { driver: true, statusEvents: { orderBy: { createdAt: "asc" } }, hotel: true },
  });

  if (!transfer) notFound();

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <AutoRefresh />
      <PublicHeader locale={locale} />
      <div className="mx-auto max-w-md px-4 pt-4">
        <p className="mb-4 text-center text-sm font-medium text-slate-500">{transfer.hotel.name}</p>
        <TripStatusView
          trip={{
            guestFirstName: transfer.guestFirstName,
            guestLastName: transfer.guestLastName,
            routeFrom: transfer.routeFrom,
            routeTo: transfer.routeTo,
            date: transfer.date,
            time: transfer.time,
            driverName: transfer.driver?.name ?? null,
            driverPhone: transfer.driver?.phone ?? null,
            events: transfer.statusEvents.map((e) => ({ status: e.status, createdAt: e.createdAt.toISOString() })),
          }}
          labels={dict.tripEvent}
          driverNotAssigned={dict.driverNotAssigned}
          driverLabel={dict.driverLabel}
          locale={LOCALE_INTL[locale]}
        />
        <p className="mt-4 text-center text-xs text-slate-400">{dict.autoRefreshNote}</p>
      </div>
    </div>
  );
}
