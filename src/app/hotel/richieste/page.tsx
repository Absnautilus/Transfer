import { prisma } from "@/lib/prisma";
import { requireHotelUser } from "@/lib/session";
import { REQUEST_STATUS } from "@/lib/constants";
import { RequestRow } from "./request-row";
import { Badge } from "@/components/ui/badge";

export default async function HotelRequestsPage() {
  const user = await requireHotelUser();

  const [pending, recent] = await Promise.all([
    prisma.transferRequest.findMany({
      where: { hotelId: user.hotelId, status: REQUEST_STATUS.PENDING },
      orderBy: { createdAt: "asc" },
    }),
    prisma.transferRequest.findMany({
      where: { hotelId: user.hotelId, status: { not: REQUEST_STATUS.PENDING } },
      orderBy: { reviewedAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Richieste di transfer</h1>
          <p className="text-sm text-slate-500">Verifica e conferma le richieste inviate dagli ospiti tramite il questionario.</p>
        </div>
        <Badge>{pending.length} in attesa</Badge>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Nessuna richiesta in attesa al momento.
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((request) => (
            <RequestRow
              key={request.id}
              request={{
                ...request,
                createdAt: request.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-slate-500">Richieste recenti</h2>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-2">Ospite</th>
                  <th className="px-4 py-2">Data</th>
                  <th className="px-4 py-2">Esito</th>
                  <th className="px-4 py-2">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2">
                      {r.guestFirstName} {r.guestLastName}
                    </td>
                    <td className="px-4 py-2">
                      {r.date} {r.time}
                    </td>
                    <td className="px-4 py-2">
                      {r.status === REQUEST_STATUS.ACCEPTED ? (
                        <span className="text-emerald-600">Accettata</span>
                      ) : (
                        <span className="text-red-600">Rifiutata</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-500">{r.rejectionReason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
