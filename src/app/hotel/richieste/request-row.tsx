"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { acceptRequest, rejectRequest } from "./actions";
import { formatBags } from "@/lib/bags";

type Request = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string | null;
  bookingNumber: string | null;
  pax: number;
  bagsCabin: number;
  bagsStandard: number;
  bagsLarge: number;
  date: string;
  time: string;
  isNightService: boolean;
  routeFrom: string;
  routeTo: string;
  quotedPrice: number | null;
  flightOrTrainNumber: string | null;
  flightOrTrainOrigin: string | null;
  notes: string | null;
  createdAt: string;
};

export function RequestRow({ request }: { request: Request }) {
  const [showReject, setShowReject] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const route = `${request.routeFrom} → ${request.routeTo}`;
  const bags = formatBags(request.bagsCabin, request.bagsStandard, request.bagsLarge);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{request.guestName}</p>
          <p className="text-sm text-slate-500">
            {request.date} · {request.time} {request.isNightService && <span className="text-indigo-600">(notturno)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                try {
                  await acceptRequest(request.id);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Errore");
                }
              })
            }
          >
            Accetta
          </Button>
          <Button size="sm" variant="danger" disabled={pending} onClick={() => setShowReject((v) => !v)}>
            Rifiuta
          </Button>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600 sm:grid-cols-4">
        <div>
          <dt className="text-slate-400">Tratta</dt>
          <dd>{route}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Pax / Bagagli</dt>
          <dd>
            {request.pax} pax {bags && `· ${bags}`}
          </dd>
        </div>
        {request.quotedPrice != null && (
          <div>
            <dt className="text-slate-400">Tariffa indicativa</dt>
            <dd>€ {request.quotedPrice.toFixed(2)}</dd>
          </div>
        )}
        <div>
          <dt className="text-slate-400">Camera / Prenotazione</dt>
          <dd>
            {request.roomNumber || "—"} {request.bookingNumber && `· ${request.bookingNumber}`}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Contatti</dt>
          <dd>
            {request.guestPhone} · {request.guestEmail}
          </dd>
        </div>
        {(request.flightOrTrainNumber || request.flightOrTrainOrigin) && (
          <div>
            <dt className="text-slate-400">Volo / Treno</dt>
            <dd>
              {request.flightOrTrainNumber} {request.flightOrTrainOrigin && `da ${request.flightOrTrainOrigin}`}
            </dd>
          </div>
        )}
        {request.notes && (
          <div className="col-span-2 sm:col-span-4">
            <dt className="text-slate-400">Note</dt>
            <dd>{request.notes}</dd>
          </div>
        )}
      </dl>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {showReject && (
        <form
          action={async (formData) => {
            setError(null);
            try {
              await rejectRequest(formData);
              setShowReject(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Errore");
            }
          }}
          className="mt-3 border-t border-slate-100 pt-3"
        >
          <input type="hidden" name="requestId" value={request.id} />
          <Textarea name="reason" rows={2} placeholder="Motivo del rifiuto (visibile all'ospite)…" required />
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowReject(false)}>
              Annulla
            </Button>
            <Button type="submit" size="sm" variant="danger">
              Conferma rifiuto
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
