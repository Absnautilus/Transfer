import { TRIP_EVENT, TRIP_EVENT_LABEL, type TripEvent } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const STEPS: TripEvent[] = [TRIP_EVENT.ASSIGNED, TRIP_EVENT.EN_ROUTE, TRIP_EVENT.ARRIVED, TRIP_EVENT.STARTED, TRIP_EVENT.COMPLETED];

export type TripInfo = {
  guestName: string;
  routeFrom: string;
  routeTo: string;
  date: string;
  time: string;
  driverName: string | null;
  driverPhone: string | null;
  events: { status: string; createdAt: string }[];
};

export function TripStatusView({ trip, children }: { trip: TripInfo; children?: React.ReactNode }) {
  const reachedStatuses = new Set(trip.events.map((e) => e.status));
  const lastEvent = trip.events[trip.events.length - 1];

  return (
    <div>
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{trip.guestName}</h2>
          {lastEvent && <Badge>{TRIP_EVENT_LABEL[lastEvent.status as TripEvent] ?? lastEvent.status}</Badge>}
        </div>
        <p className="text-sm text-slate-500">
          {trip.date} · {trip.time}
        </p>
        <p className="mt-2 text-base font-medium text-slate-800">
          {trip.routeFrom} <span className="text-slate-400">→</span> {trip.routeTo}
        </p>

        <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm">
          {trip.driverName ? (
            <p>
              Autista: <span className="font-medium text-slate-900">{trip.driverName}</span>
              {trip.driverPhone && <span className="text-slate-500"> · {trip.driverPhone}</span>}
            </p>
          ) : (
            <p className="text-slate-500">Autista non ancora assegnato.</p>
          )}
        </div>

        <ol className="mt-6 space-y-4">
          {STEPS.map((step) => {
            const reached = reachedStatuses.has(step);
            const event = trip.events.find((e) => e.status === step);
            return (
              <li key={step} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    reached ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {reached ? "✓" : ""}
                </span>
                <div>
                  <p className={reached ? "font-medium text-slate-900" : "text-slate-400"}>{TRIP_EVENT_LABEL[step]}</p>
                  {event && <p className="text-xs text-slate-400">{new Date(event.createdAt).toLocaleTimeString("it-IT")}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
