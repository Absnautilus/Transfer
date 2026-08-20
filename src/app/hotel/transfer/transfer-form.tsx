"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label, Select, Textarea } from "@/components/ui/field";
import { BagsInput } from "@/components/bags-input";
import { RoutePointSelect } from "@/components/route-point-select";
import { isRedirectError } from "@/lib/is-redirect-error";
import { isNightTime } from "@/lib/night";

export type TransferFormValues = {
  transferId?: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  roomNumber?: string | null;
  bookingNumber?: string | null;
  pax: number;
  bagsPersonal?: number;
  bagsCabin?: number;
  bagsStandard?: number;
  bagsLarge?: number;
  date: string;
  time: string;
  routeFrom: string;
  routeTo: string;
  flightOrTrainNumber?: string | null;
  flightOrTrainOrigin?: string | null;
  notes?: string | null;
  price?: number | null;
  priceAdjustmentType?: string | null;
  priceAdjustmentAmount?: number | null;
};

export function TransferForm({
  initial,
  action,
  submitLabel,
  routePoints,
}: {
  initial?: TransferFormValues;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  routePoints: string[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [time, setTime] = useState(initial?.time ?? "");
  const [adjustmentType, setAdjustmentType] = useState(initial?.priceAdjustmentType ?? "NONE");
  const isNightService = isNightTime(time);

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
          <Label htmlFor="guestFirstName" required>
            Nome ospite
          </Label>
          <Input id="guestFirstName" name="guestFirstName" defaultValue={initial?.guestFirstName} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="guestLastName" required>
            Cognome ospite
          </Label>
          <Input id="guestLastName" name="guestLastName" defaultValue={initial?.guestLastName} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="roomNumber">Camera</Label>
          <Input id="roomNumber" name="roomNumber" defaultValue={initial?.roomNumber ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="bookingNumber">Numero prenotazione</Label>
          <Input id="bookingNumber" name="bookingNumber" defaultValue={initial?.bookingNumber ?? ""} />
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
          <Label htmlFor="pax" required>
            Pax
          </Label>
          <Input id="pax" name="pax" type="number" min={1} max={50} defaultValue={initial?.pax ?? 1} required />
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
          <Input id="time" name="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </FieldGroup>
        <FieldGroup className="flex items-end pb-1">
          <p className="text-sm text-slate-500">
            Servizio notturno (22:00–07:00):{" "}
            <span className={isNightService ? "font-medium text-purple-600" : "text-slate-400"}>{isNightService ? "Sì" : "No"}</span>
          </p>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="routeFrom" required>
            Partenza
          </Label>
          <RoutePointSelect name="routeFrom" points={routePoints} defaultValue={initial?.routeFrom} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="routeTo" required>
            Arrivo
          </Label>
          <RoutePointSelect name="routeTo" points={routePoints} defaultValue={initial?.routeTo} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="flightOrTrainNumber">Numero volo / treno (facoltativo)</Label>
          <Input id="flightOrTrainNumber" name="flightOrTrainNumber" defaultValue={initial?.flightOrTrainNumber ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="flightOrTrainOrigin">Provenienza (facoltativo)</Label>
          <Input id="flightOrTrainOrigin" name="flightOrTrainOrigin" defaultValue={initial?.flightOrTrainOrigin ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="price">Tariffa (€)</Label>
          <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={initial?.price ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="priceAdjustmentType">Sconto / Maggiorazione</Label>
          <Select id="priceAdjustmentType" name="priceAdjustmentType" value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value)}>
            <option value="NONE">Nessuno</option>
            <option value="DISCOUNT">Sconto</option>
            <option value="SURCHARGE">Maggiorazione</option>
          </Select>
        </FieldGroup>
        {adjustmentType !== "NONE" && (
          <FieldGroup>
            <Label htmlFor="priceAdjustmentAmount">Importo (€)</Label>
            <Input
              id="priceAdjustmentAmount"
              name="priceAdjustmentAmount"
              type="number"
              min={0}
              step="0.01"
              defaultValue={initial?.priceAdjustmentAmount ?? ""}
            />
          </FieldGroup>
        )}
      </div>

      <FieldGroup>
        <BagsInput
          personalDefault={initial?.bagsPersonal ?? 0}
          cabinDefault={initial?.bagsCabin ?? 0}
          standardDefault={initial?.bagsStandard ?? 0}
          largeDefault={initial?.bagsLarge ?? 0}
        />
      </FieldGroup>

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
