"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label, Select } from "@/components/ui/field";
import { createOperator } from "../actions";

type Org = { id: string; name: string };

export function OperatorForm({ hotels, taxiCompanies }: { hotels: Org[]; taxiCompanies: Org[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [orgType, setOrgType] = useState<"HOTEL" | "TAXI">("HOTEL");
  const orgs = useMemo(() => (orgType === "HOTEL" ? hotels : taxiCompanies), [orgType, hotels, taxiCompanies]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createOperator(formData);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
        <FieldGroup>
          <Label htmlFor="orgType" required>
            Tipo organizzazione
          </Label>
          <Select id="orgType" name="orgType" value={orgType} onChange={(e) => setOrgType(e.target.value as "HOTEL" | "TAXI")}>
            <option value="HOTEL">Hotel</option>
            <option value="TAXI">Compagnia taxi</option>
          </Select>
        </FieldGroup>
        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="orgId" required>
            Organizzazione
          </Label>
          <Select id="orgId" name="orgId" required defaultValue="">
            <option value="" disabled>
              Seleziona…
            </option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
        <FieldGroup>
          <Label htmlFor="name" required>
            Nome
          </Label>
          <Input id="name" name="name" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="email" required>
            Nome utente (o email)
          </Label>
          <Input id="email" name="email" type="text" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="password" required>
            Password provvisoria
          </Label>
          <Input id="password" name="password" minLength={6} required />
        </FieldGroup>
      </div>

      <FieldGroup className="flex items-center">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isOrgAdmin" value="true" className="h-4 w-4 rounded border-slate-300" />
          Amministratore dell&apos;organizzazione (vede contabilità, gestisce il team)
        </label>
      </FieldGroup>

      <FieldError>{error ?? undefined}</FieldError>

      <Button type="submit" variant="secondary" disabled={pending} className="mt-2">
        {pending ? "Creazione…" : "Crea operatore"}
      </Button>
    </form>
  );
}
