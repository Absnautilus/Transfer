"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label } from "@/components/ui/field";
import { createTaxiCompany } from "../actions";

export function TaxiCompanyForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createTaxiCompany(formData);
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
            Nome compagnia
          </Label>
          <Input id="name" name="name" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="commissionRate">Provvigione (%)</Label>
          <Input id="commissionRate" name="commissionRate" type="number" min={0} max={100} step="0.1" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="phone">Telefono</Label>
          <Input id="phone" name="phone" />
        </FieldGroup>
      </div>

      <p className="mb-2 mt-2 text-xs font-medium text-slate-500">Primo operatore (accesso amministratore della compagnia)</p>
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
          {pending ? "Creazione…" : "Crea compagnia"}
        </Button>
      </div>
    </form>
  );
}
