"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label } from "@/components/ui/field";
import { updateTaxiCompany } from "../actions";

export function EditTaxiCompanyForm({
  taxiCompany,
}: {
  taxiCompany: { id: string; name: string; email: string | null; phone: string | null; commissionRate: number | null };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateTaxiCompany(taxiCompany.id, formData);
        router.push("/admin/taxi-companies");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore");
      }
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="name" required>
            Nome compagnia
          </Label>
          <Input id="name" name="name" defaultValue={taxiCompany.name} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="commissionRate">Provvigione (%)</Label>
          <Input id="commissionRate" name="commissionRate" type="number" min={0} max={100} step="0.1" defaultValue={taxiCompany.commissionRate ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={taxiCompany.email ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="phone">Telefono</Label>
          <Input id="phone" name="phone" defaultValue={taxiCompany.phone ?? ""} />
        </FieldGroup>
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/taxi-companies")}>
          Annulla
        </Button>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Salvataggio…" : "Salva modifiche"}
        </Button>
      </div>
    </form>
  );
}
