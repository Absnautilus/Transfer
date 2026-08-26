"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label, Select } from "@/components/ui/field";
import { createHotel } from "../actions";

export function HotelForm({ taxiCompanies }: { taxiCompanies: { id: string; name: string }[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createHotel(formData);
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
          <Label htmlFor="name" required>
            Nome hotel
          </Label>
          <Input id="name" name="name" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="slug" required>
            Slug (per l&apos;URL /richiedi/…)
          </Label>
          <Input id="slug" name="slug" placeholder="es. palazzo-veneziano" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="address">Indirizzo</Label>
          <Input id="address" name="address" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="email">Email hotel</Label>
          <Input id="email" name="email" type="email" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="phone">Telefono</Label>
          <Input id="phone" name="phone" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="primaryTaxiCompanyId">Compagnia taxi principale</Label>
          <Select id="primaryTaxiCompanyId" name="primaryTaxiCompanyId" defaultValue="">
            <option value="">Nessuna (da assegnare in seguito)</option>
            {taxiCompanies.map((tc) => (
              <option key={tc.id} value={tc.id}>
                {tc.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <p className="mb-2 mt-2 text-xs font-medium text-slate-500">Primo operatore (accesso amministratore dell&apos;hotel)</p>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
        <FieldGroup>
          <Label htmlFor="staffName" required>
            Nome
          </Label>
          <Input id="staffName" name="staffName" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="staffEmail" required>
            Email di accesso
          </Label>
          <Input id="staffEmail" name="staffEmail" type="email" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="staffPassword" required>
            Password provvisoria
          </Label>
          <Input id="staffPassword" name="staffPassword" minLength={6} required />
        </FieldGroup>
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <div className="mt-2 flex justify-end">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Creazione…" : "Crea hotel"}
        </Button>
      </div>
    </form>
  );
}
