"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label, Textarea } from "@/components/ui/field";
import { isRedirectError } from "@/lib/is-redirect-error";

export type TransferFormValues = {
  transferId?: string;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  roomNumber?: string | null;
  bookingNumber?: string | null;
  pax: number;
  bags?: string | null;
  date: string;
  time: string;
  isNightService: boolean;
  routeFrom: string;
  routeTo: string;
  flightOrTrainNumber?: string | null;
  flightOrTrainOrigin?: string | null;
  notes?: string | null;
  price?: number | null;
  operatorInitials?: string | null;
};

export function TransferForm({
  initial,
  action,
  submitLabel,
}: {
  initial?: TransferFormValues;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setError(err instanceof Error ? err.message : "Errore");
      }
    });
  }

  return (
    <form onSubmit={onSubmit}>
      {initial?.transferId && <input type="hidden" name="transferId" defaultValue={initial.transferId} />}
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="guestName" required>
            Nome ospite
          </Label>
          <Input id="guestName" name="guestName" defaultValue={initial?.guestName} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="roomNumber">Camera</Label>
          <Input id="roomNumber" name="roomNumber" defaultValue={initial?.roomNumber ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="guestEmail">Email</Label>
          <Input id="guestEmail" name="guestEmail" type="email" defaultValue={initial?.guestEmail ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="guestPhone">Telefono</Label>
          <Input id="guestPhone" name="guestPhone" defaultValue={initial?.guestPhone ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="bookingNumber">Numero prenotazione</Label>
          <Input id="bookingNumber" name="bookingNumber" defaultValue={initial?.bookingNumber ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="pax" required>
            Pax
          </Label>
          <Input id="pax" name="pax" type="number" min={1} max={50} defaultValue={initial?.pax ?? 1} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="bags">Bagagli</Label>
          <Input id="bags" name="bags" defaultValue={initial?.bags ?? ""} />
        </FieldGroup>
        <FieldGroup className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isNightService" value="true" defaultChecked={initial?.isNightService} className="h-4 w-4 rounded border-slate-300" />
            Servizio notturno
          </label>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="date" required>
            Data
          </Label>
          <Input id="date" name="date" type="date" defaultValue={initial?.date} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="time" required>
            Orario
          </Label>
          <Input id="time" name="time" type="time" defaultValue={initial?.time} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="routeFrom" required>
            Partenza
          </Label>
          <Input id="routeFrom" name="routeFrom" defaultValue={initial?.routeFrom} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="routeTo" required>
            Arrivo
          </Label>
          <Input id="routeTo" name="routeTo" defaultValue={initial?.routeTo} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="flightOrTrainNumber">Numero volo / treno</Label>
          <Input id="flightOrTrainNumber" name="flightOrTrainNumber" defaultValue={initial?.flightOrTrainNumber ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="flightOrTrainOrigin">Provenienza</Label>
          <Input id="flightOrTrainOrigin" name="flightOrTrainOrigin" defaultValue={initial?.flightOrTrainOrigin ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="price">Tariffa (€)</Label>
          <Input id="price" name="price" type="number" step="0.01" defaultValue={initial?.price ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="operatorInitials">Sigla operatore</Label>
          <Input id="operatorInitials" name="operatorInitials" defaultValue={initial?.operatorInitials ?? ""} />
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label htmlFor="notes">Note</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={initial?.notes ?? ""} />
      </FieldGroup>

      <FieldError>{error ?? undefined}</FieldError>

      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? "Salvataggio…" : submitLabel}
      </Button>
    </form>
  );
}
