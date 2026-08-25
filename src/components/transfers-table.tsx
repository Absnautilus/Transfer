import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TaxiRowActions } from "@/components/taxi-row-actions";
import { HotelRowActions } from "@/components/hotel-row-actions";
import { FlightCheckButton } from "@/components/flight-check-button";
import { TRIP_EVENT_LABEL, type TripEvent } from "@/lib/constants";

type Transfer = {
  id: string;
  date: string;
  time: string;
  isNightService: boolean;
  guestFirstName: string;
  guestLastName: string;
  roomNumber: string | null;
  bookingNumber: string | null;
  pax: number;
  bags: string | null;
  routeFrom: string;
  routeTo: string;
  arrivalMode?: string | null;
  flightOrTrainNumber: string | null;
  flightOrTrainOrigin: string | null;
  status: string;
  driverId: string | null;
  driver: { id: string; name: string } | null;
  statusEvents?: { status: string; createdAt: Date | string }[];
  cancellationReason?: string | null;
  penaltyType?: string | null;
  penaltyAmount?: number | null;
};

const PENALTY_LABEL: Record<string, string> = { NONE: "Senza penale", FULL: "Penale totale", PARTIAL: "Penale parziale" };

type Driver = { id: string; name: string; active: boolean };

export function TransfersTable({
  transfers,
  scope,
  drivers,
}: {
  transfers: Transfer[];
  scope: "hotel" | "taxi";
  drivers?: Driver[];
}) {
  if (transfers.length === 0) {
    return <EmptyState title="Nessun transfer trovato per i filtri selezionati" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
          <tr>
            <th className="px-3 py-2">Ora</th>
            <th className="px-3 py-2">Ospite</th>
            <th className="px-3 py-2">Camera / Pren.</th>
            <th className="px-3 py-2">Pax / Bagagli</th>
            <th className="px-3 py-2">Tratta</th>
            <th className="px-3 py-2">Volo / Treno</th>
            <th className="px-3 py-2">Stato</th>
            <th className="px-3 py-2">Autista</th>
            <th className="px-3 py-2">Azioni</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transfers.map((t) => (
            <tr key={t.id} className="align-top">
              <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-900">
                {t.time}
                {t.isNightService && <div className="text-xs font-normal text-purple-600">notturno</div>}
                <div className="text-xs font-normal text-slate-400">{t.date}</div>
              </td>
              <td className="px-3 py-3">
                {t.guestFirstName} {t.guestLastName}
              </td>
              <td className="px-3 py-3 text-slate-600">
                {t.roomNumber || "—"}
                {t.bookingNumber && <div className="text-xs text-slate-400">{t.bookingNumber}</div>}
              </td>
              <td className="px-3 py-3 text-slate-600">
                {t.pax} pax
                {t.bags && <div className="text-xs text-slate-400">{t.bags}</div>}
              </td>
              <td className="px-3 py-3 text-slate-600">
                {t.routeFrom} → {t.routeTo}
              </td>
              <td className="px-3 py-3 text-slate-600">
                {t.flightOrTrainNumber || "—"}
                {t.flightOrTrainOrigin && <div className="text-xs text-slate-400">{t.flightOrTrainOrigin}</div>}
                {t.arrivalMode === "AEREO" && t.flightOrTrainNumber && (
                  <FlightCheckButton flightNumber={t.flightOrTrainNumber} date={t.date} time={t.time} />
                )}
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={t.status} />
                {t.statusEvents?.[0] && t.status !== "CANCELLED" && (
                  <div className="mt-1 text-xs text-slate-400">
                    {TRIP_EVENT_LABEL[t.statusEvents[0].status as TripEvent] ?? t.statusEvents[0].status}
                  </div>
                )}
                {t.status === "CANCELLED" && t.penaltyType && (
                  <div className="mt-1 text-xs text-slate-400">
                    {PENALTY_LABEL[t.penaltyType] ?? t.penaltyType}
                    {t.penaltyType === "PARTIAL" && t.penaltyAmount != null && ` (€ ${t.penaltyAmount.toFixed(2)})`}
                  </div>
                )}
              </td>
              <td className="px-3 py-3 text-slate-600">
                {scope === "hotel" ? t.driver?.name ?? "—" : null}
              </td>
              <td className="px-3 py-3">
                {scope === "taxi" ? (
                  <TaxiRowActions transferId={t.id} status={t.status} driverId={t.driverId} drivers={drivers ?? []} />
                ) : (
                  <HotelRowActions transferId={t.id} date={t.date} status={t.status} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
