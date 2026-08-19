"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label, Select, Textarea } from "@/components/ui/field";
import { submitTransferRequest } from "./actions";

type Route = { id: string; label: string };

export function RequestForm({ hotelSlug, hotelName, routes }: { hotelSlug: string; hotelName: string; routes: Route[] }) {
  const [useCustomRoute, setUseCustomRoute] = useState(routes.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

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

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (!useCustomRoute) {
      formData.delete("routeFrom");
      formData.delete("routeTo");
    } else {
      formData.delete("routeLabel");
    }
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
          <Label htmlFor="guestPhone" required>
            Telefono (con prefisso internazionale)
          </Label>
          <Input id="guestPhone" name="guestPhone" placeholder="+39 333 1234567" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="bookingNumber">Numero prenotazione</Label>
          <Input id="bookingNumber" name="bookingNumber" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="pax" required>
            Numero passeggeri
          </Label>
          <Input id="pax" name="pax" type="number" min={1} max={50} defaultValue={1} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="bags">Bagagli (numero e tipo)</Label>
          <Input id="bags" name="bags" placeholder="es. 2 valigie + 1 passeggino" />
        </FieldGroup>
        <FieldGroup className="flex items-end gap-2 pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isNightService" value="true" className="h-4 w-4 rounded border-slate-300" />
            Servizio notturno (22:00 – 07:00)
          </label>
        </FieldGroup>
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
      </div>

      <FieldGroup>
        <Label required>Tratta</Label>
        {routes.length > 0 && (
          <div className="mb-2 flex gap-4 text-sm text-slate-600">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={!useCustomRoute} onChange={() => setUseCustomRoute(false)} />
              Tratta standard
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={useCustomRoute} onChange={() => setUseCustomRoute(true)} />
              Tratta personalizzata
            </label>
          </div>
        )}
        {!useCustomRoute ? (
          <Select id="routeLabel" name="routeLabel" required={!useCustomRoute} defaultValue="">
            <option value="" disabled>
              Seleziona una tratta…
            </option>
            {routes.map((r) => (
              <option key={r.id} value={r.label}>
                {r.label}
              </option>
            ))}
          </Select>
        ) : (
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Input name="routeFrom" placeholder="Punto di partenza" required={useCustomRoute} />
            <Input name="routeTo" placeholder="Punto di arrivo" required={useCustomRoute} className="mt-2 sm:mt-0" />
          </div>
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

      <FieldError>{error ?? undefined}</FieldError>

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Invio in corso…" : "Invia richiesta"}
      </Button>
    </form>
  );
}
