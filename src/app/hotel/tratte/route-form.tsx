"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label, Select, Textarea } from "@/components/ui/field";
import { PAX_BANDS } from "@/lib/pricing";
import { createRoute } from "./actions";

const POINT_CATEGORIES = [
  { value: "AEROPORTO", label: "Aeroporto" },
  { value: "STAZIONE", label: "Stazione" },
  { value: "PORTO", label: "Porto" },
  { value: "ALTRO", label: "Altro" },
] as const;

const PRICE_FIELDS = [
  { key: "1_4", label: "1-4" },
  { key: "5", label: "5" },
  { key: "6", label: "6" },
  { key: "7", label: "7" },
  { key: "8", label: "8" },
] as const;

export function RouteForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createRoute(formData);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="pointLabel" required>
            Punto (aeroporto, stazione, porto, ecc.)
          </Label>
          <Input id="pointLabel" name="pointLabel" placeholder="es. Aeroporto Marco Polo (VCE)" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="pointCategory">Categoria</Label>
          <Select id="pointCategory" name="pointCategory" defaultValue="ALTRO">
            {POINT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label htmlFor="transferMode">Modalità di transfer (opzionale)</Label>
        <Input id="transferMode" name="transferMode" placeholder="es. Auto privata + Taxi acqueo" />
      </FieldGroup>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="descriptionArrival">Descrizione per l&apos;ospite in arrivo</Label>
          <Textarea id="descriptionArrival" name="descriptionArrival" rows={2} placeholder="es. Attendiamo in area arrivi con cartello nominativo…" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="descriptionDeparture">Descrizione per l&apos;ospite in partenza</Label>
          <Textarea id="descriptionDeparture" name="descriptionDeparture" rows={2} placeholder="es. Ritiro dalla hall dell'hotel…" />
        </FieldGroup>
      </div>
      <FieldGroup className="w-40">
        <Label htmlFor="durationMinutes">Durata (minuti)</Label>
        <Input id="durationMinutes" name="durationMinutes" type="number" min={0} />
      </FieldGroup>

      <div className="mt-2 overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Prezzo (€)</th>
              {PAX_BANDS.map((b) => (
                <th key={b} className="px-3 py-2">
                  {b} pax
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-3 py-2 font-medium text-slate-700">Diurno</td>
              {PRICE_FIELDS.map((f) => (
                <td key={f.key} className="px-2 py-2">
                  <Input name={`dayPrice${f.key}`} type="number" min={0} step="0.01" className="w-20" />
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium text-slate-700">Notturno</td>
              {PRICE_FIELDS.map((f) => (
                <td key={f.key} className="px-2 py-2">
                  <Input name={`nightPrice${f.key}`} type="number" min={0} step="0.01" className="w-20" />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <Button type="submit" variant="secondary" disabled={pending} className="mt-4">
        {pending ? "Aggiunta…" : "Aggiungi tratta"}
      </Button>
    </form>
  );
}
