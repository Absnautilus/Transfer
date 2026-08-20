import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { REQUEST_STATUS, TRANSFER_STATUS } from "@/lib/constants";
import { todayISO } from "@/lib/date";

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
        {cards.map((c) => {
          const content = (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase text-slate-400">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{c.value}</p>
            </div>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="hover:border-purple-300">
              {content}
            </Link>
          ) : (
            <div key={c.label}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
