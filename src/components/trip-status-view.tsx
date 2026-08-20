import { TRIP_EVENT, TRIP_EVENT_LABEL, type TripEvent } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const STEPS: TripEvent[] = [TRIP_EVENT.ASSIGNED, TRIP_EVENT.EN_ROUTE, TRIP_EVENT.ARRIVED, TRIP_EVENT.STARTED, TRIP_EVENT.COMPLETED];

export type TripInfo = {
  guestFirstName: string;
  guestLastName: string;
  routeFrom: string;
  routeTo: string;
  date: string;
  time: string;
  driverName: string | null;
  driverPhone: string | null;
  events: { status: string; createdAt: string }[];
};

export function TripStatusView({
  trip,
  children,
  labels,
  driverNotAssigned = "Autista non ancora assegnato.",
  driverLabel = "Autista:",
  locale = "it-IT",
}: {
  trip: TripInfo;
  children?: React.ReactNode;
  labels?: Record<TripEvent, string>;
  driverNotAssigned?: string;
  driverLabel?: string;
  locale?: string;
}) {
  const stepLabels = labels ?? TRIP_EVENT_LABEL;
  const reachedStatuses = new Set(trip.events.map((e) => e.status));
  const lastEvent = trip.events[trip.events.length - 1];

  return (
    <div>
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {trip.guestFirstName} {trip.guestLastName}
          </h2>
          {lastEvent && <Badge>{stepLabels[lastEvent.status as TripEvent] ?? lastEvent.status}</Badge>}
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
              {driverLabel} <span className="font-medium text-slate-900">{trip.driverName}</span>
              {trip.driverPhone && <span className="text-slate-500"> · {trip.driverPhone}</span>}
            </p>
          ) : (
            <p className="text-slate-500">{driverNotAssigned}</p>
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
                  <p className={reached ? "font-medium text-slate-900" : "text-slate-400"}>{stepLabels[step]}</p>
                  {event && <p className="text-xs text-slate-400">{new Date(event.createdAt).toLocaleTimeString(locale)}</p>}
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
