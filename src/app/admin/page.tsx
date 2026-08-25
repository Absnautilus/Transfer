import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { REQUEST_STATUS, TRANSFER_STATUS } from "@/lib/constants";
import { todayISO } from "@/lib/date";
import { StatCard } from "@/components/ui/stat-card";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [hotelCount, taxiCompanyCount, userCount, pendingRequests, transfersToday, activeTransfers] = await Promise.all([
    prisma.hotel.count(),
    prisma.taxiCompany.count(),
    prisma.user.count(),
    prisma.transferRequest.count({ where: { status: REQUEST_STATUS.PENDING } }),
    prisma.transfer.count({ where: { date: todayISO() } }),
    prisma.transfer.count({ where: { status: { notIn: [TRANSFER_STATUS.COMPLETED, TRANSFER_STATUS.CANCELLED] } } }),
  ]);

  const cards = [
    { label: "Hotel", value: hotelCount, href: "/admin/hotels" },
    { label: "Compagnie taxi", value: taxiCompanyCount, href: "/admin/taxi-companies" },
    { label: "Utenti totali", value: userCount, href: "/admin/impostazioni" },
    { label: "Richieste in attesa", value: pendingRequests, href: null },
    { label: "Transfer oggi", value: transfersToday, href: null },
    { label: "Transfer attivi", value: activeTransfers, href: null },
  ];

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Panoramica piattaforma</h1>
      <p className="mb-6 text-sm text-slate-500">Vista d&apos;insieme su tutti gli hotel e le compagnie taxi registrati.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} href={c.href} />
        ))}
      </div>
    </div>
  );
}
