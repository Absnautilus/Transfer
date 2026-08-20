import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDriverUser } from "@/lib/session";
import { todayISO } from "@/lib/transfers";
import { StatusBadge } from "@/components/ui/badge";
import { TRANSFER_STATUS } from "@/lib/constants";

export default async function DriverHomePage() {
  const user = await requireDriverUser();
  const today = todayISO();

  const transfers = await prisma.transfer.findMany({
    where: { driverId: user.driverId, date: { gte: today }, status: { notIn: [TRANSFER_STATUS.CANCELLED] } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">I miei transfer</h1>
      {transfers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Nessun transfer assegnato al momento.
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((t) => (
            <Link
              key={t.id}
              href={`/driver/${t.id}`}
              className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {t.guestFirstName} {t.guestLastName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t.date} · {t.time} · {t.routeFrom} → {t.routeTo}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
