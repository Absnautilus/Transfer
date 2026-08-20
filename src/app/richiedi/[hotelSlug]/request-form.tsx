"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label, Textarea } from "@/components/ui/field";
import { PhoneInput } from "@/components/phone-input";
import { computePrice, isValidPriceTiers, type PriceTiers } from "@/lib/pricing";
import { submitTransferRequest } from "./actions";

type Route = {
  id: string;
  pointLabel: string;
  transferMode: string | null;
  description: string | null;
  durationMinutes: number | null;
  priceTiers: unknown;
};

const CANCELLATION_POLICY =
  "Cancellazioni gratuite fino a 3 ore prima dell'orario di arrivo previsto. Entro le 3 ore o in caso di mancata presentazione (no-show), il servizio non è rimborsabile. Per i servizi in partenza da aeroporti la tariffa include fino a 1 ora di attesa dall'atterraggio effettivo del volo; per gli altri punti d'incontro l'attesa inclusa è di 15 minuti, oltre la quale è previsto un supplemento di € 50,00.";

export function RequestForm({ hotelSlug, hotelName, routes }: { hotelSlug: string; hotelName: string; routes: Route[] }) {
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const points = useMemo(() => Array.from(new Set(routes.map((r) => r.pointLabel))), [routes]);
  const [direction, setDirection] = useState<"ARRIVO" | "PARTENZA">("ARRIVO");
  const [selectedPoint, setSelectedPoint] = useState(points[0] ?? "");
  const modesForPoint = useMemo(() => routes.filter((r) => r.pointLabel === selectedPoint), [routes, selectedPoint]);
  const [selectedRouteId, setSelectedRouteId] = useState(modesForPoint[0]?.id ?? "");
  const selectedRoute = modesForPoint.find((r) => r.id === selectedRouteId) ?? modesForPoint[0];

  const [pax, setPax] = useState(1);
  const [isNightService, setIsNightService] = useState(false);

  const price = useMemo(() => {
    if (!selectedRoute || !isValidPriceTiers(selectedRoute.priceTiers)) return null;
    return computePrice(selectedRoute.priceTiers as PriceTiers, pax, isNightService);
  }, [selectedRoute, pax, isNightService]);

  function onPointChange(point: string) {
    setSelectedPoint(point);
    const modes = routes.filter((r) => r.pointLabel === point);
    setSelectedRouteId(modes[0]?.id ?? "");
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-800">Richiesta inviata!</p>
        <p className="mt-2 text-sm text-emerald-700">
          {hotelName} riceverà la sua richiesta e la contatterà via email non appena verrà verificata.
        </p>
      </div>
    );
  }

  if (routes.length === 0) {
    return <p className="text-sm text-slate-500">Nessuna tratta configurata al momento. Contatti direttamente l&apos;hotel.</p>;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("routeOptionId", selectedRouteId);
    formData.set("direction", direction);
    startTransition(async () => {
      const result = await submitTransferRequest(hotelSlug, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="guestName" required>
            Nome e cognome
          </Label>
          <Input id="guestName" name="guestName" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="roomNumber">Numero camera (se già assegnato)</Label>
          <Input id="roomNumber" name="roomNumber" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="guestEmail" required>
            Email
          </Label>
          <Input id="guestEmail" name="guestEmail" type="email" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="bookingNumber">Numero prenotazione</Label>
          <Input id="bookingNumber" name="bookingNumber" />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label required>Telefono</Label>
        <PhoneInput name="guestPhone" required />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="date" required>
            Data
          </Label>
          <Input id="date" name="date" type="date" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="time" required>
            Orario
          </Label>
          <Input id="time" name="time" type="time" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="pax" required>
            Numero passeggeri
          </Label>
          <Input id="pax" name="pax" type="number" min={1} max={50} value={pax} onChange={(e) => setPax(Number(e.target.value) || 1)} required />
        </FieldGroup>
        <FieldGroup className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isNightService"
              value="true"
              checked={isNightService}
              onChange={(e) => setIsNightService(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Servizio notturno (22:00 – 07:00)
          </label>
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label>Bagagli</Label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="mb-1 text-xs text-slate-500">Cabina (≤ 55×40×20 cm)</p>
            <Input name="bagsCabin" type="number" min={0} max={20} defaultValue={0} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Stiva standard (≤ 23 kg)</p>
            <Input name="bagsStandard" type="number" min={0} max={20} defaultValue={0} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Grande / voluminoso</p>
            <Input name="bagsLarge" type="number" min={0} max={20} defaultValue={0} />
          </div>
        </div>
      </FieldGroup>

      <FieldGroup>
        <Label required>Transfer</Label>
        <div className="mb-2 flex gap-4 text-sm text-slate-600">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={direction === "ARRIVO"} onChange={() => setDirection("ARRIVO")} />
            Arrivo (verso l&apos;hotel)
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={direction === "PARTENZA"} onChange={() => setDirection("PARTENZA")} />
            Partenza (dall&apos;hotel)
          </label>
        </div>

        <p className="mb-1 text-xs text-slate-500">{direction === "ARRIVO" ? "Da dove arriva" : "Dove è diretto"}</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {points.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => onPointChange(p)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                p === selectedPoint ? "border-purple-600 bg-purple-600 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {modesForPoint.length > 0 && (
          <div className="space-y-2">
            {modesForPoint.map((m) => {
              const modePrice =
                isValidPriceTiers(m.priceTiers) ? computePrice(m.priceTiers as PriceTiers, pax, isNightService) : null;
              return (
                <label
                  key={m.id}
                  className={`block cursor-pointer rounded-md border p-3 text-sm ${
                    m.id === selectedRouteId ? "border-purple-600 ring-1 ring-purple-600" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <input
                        type="radio"
                        name="routeOptionRadio"
                        className="mr-2"
                        checked={m.id === selectedRouteId}
                        onChange={() => setSelectedRouteId(m.id)}
                      />
                      <span className="font-medium text-slate-900">{m.transferMode ?? "Standard"}</span>
                      {m.durationMinutes && <span className="ml-2 text-xs text-slate-500">~{m.durationMinutes} min</span>}
                      {m.description && <p className="ml-5 mt-1 text-xs text-slate-500">{m.description}</p>}
                    </div>
                    <span className="whitespace-nowrap font-semibold text-slate-900">
                      {modePrice != null ? `€ ${modePrice.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {price != null && (
          <p className="mt-2 text-sm text-slate-600">
            Tariffa indicativa per {pax} pax{isNightService ? " (notturna)" : ""}: <strong>€ {price.toFixed(2)}</strong>
          </p>
        )}
      </FieldGroup>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="flightOrTrainNumber">Numero volo / treno</Label>
          <Input id="flightOrTrainNumber" name="flightOrTrainNumber" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="flightOrTrainOrigin">Provenienza volo / treno</Label>
          <Input id="flightOrTrainOrigin" name="flightOrTrainOrigin" />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="notes">Note aggiuntive</Label>
        <Textarea id="notes" name="notes" rows={3} placeholder="Passeggini, seggiolini, esigenze particolari…" />
      </FieldGroup>

      <div className="mb-4 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
        <p className="mb-1 font-medium text-slate-600">Politica di cancellazione</p>
        {CANCELLATION_POLICY}
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Invio in corso…" : "Invia richiesta"}
      </Button>
    </form>
  );
}
