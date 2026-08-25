import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireHotelUser } from "@/lib/session";
import { REQUEST_STATUS } from "@/lib/constants";
import { RequestRow } from "./request-row";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const TABS = [
  { key: "pending", label: "In attesa", status: REQUEST_STATUS.PENDING },
  { key: "accepted", label: "Accettate", status: REQUEST_STATUS.ACCEPTED },
  { key: "rejected", label: "Rifiutate", status: REQUEST_STATUS.REJECTED },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function HotelRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireHotelUser();
  const { tab } = await searchParams;
  const activeTab: TabKey = TABS.some((t) => t.key === tab) ? (tab as TabKey) : "pending";
  const activeStatus = TABS.find((t) => t.key === activeTab)!.status;

  const [requests, counts] = await Promise.all([
    prisma.transferRequest.findMany({
      where: { hotelId: user.hotelId, status: activeStatus },
      orderBy: activeTab === "pending" ? { createdAt: "asc" } : { reviewedAt: "desc" },
    }),
    prisma.transferRequest.groupBy({
      by: ["status"],
      where: { hotelId: user.hotelId },
      _count: { _all: true },
    }),
  ]);

  const countFor = (status: string) => counts.find((c) => c.status === status)?._count._all ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Richieste di transfer</h1>
        <p className="text-sm text-slate-500">Verifica e conferma le richieste inviate dagli ospiti tramite il questionario.</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200">
        {TABS.map((t) => {
          const count = countFor(t.status);
          const isActive = t.key === activeTab;
          return (
            <Link
              key={t.key}
              href={`/hotel/richieste?tab=${t.key}`}
              className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium ${
                isActive ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
              <Badge className={isActive ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-600"}>{count}</Badge>
            </Link>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title={`Nessuna richiesta ${activeTab === "pending" ? "in attesa" : activeTab === "accepted" ? "accettata" : "rifiutata"} al momento`}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <RequestRow
              key={request.id}
              mode={activeTab}
              request={{
                ...request,
                createdAt: request.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
