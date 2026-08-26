"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label, Select } from "@/components/ui/field";
import { updateHotel } from "../actions";

export function EditHotelForm({
  hotel,
  taxiCompanies,
}: {
  hotel: { id: string; name: string; slug: string; address: string | null; email: string | null; phone: string | null; primaryTaxiCompanyId: string | null };
  taxiCompanies: { id: string; name: string }[];
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
        await updateHotel(hotel.id, formData);
        router.push("/admin/hotels");
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
            Nome hotel
          </Label>
          <Input id="name" name="name" defaultValue={hotel.name} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="slug" required>
            Slug (per l&apos;URL /richiedi/…)
          </Label>
          <Input id="slug" name="slug" defaultValue={hotel.slug} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="address">Indirizzo</Label>
          <Input id="address" name="address" defaultValue={hotel.address ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="email">Email hotel</Label>
          <Input id="email" name="email" type="email" defaultValue={hotel.email ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="phone">Telefono</Label>
          <Input id="phone" name="phone" defaultValue={hotel.phone ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="primaryTaxiCompanyId">Compagnia taxi principale</Label>
          <Select id="primaryTaxiCompanyId" name="primaryTaxiCompanyId" defaultValue={hotel.primaryTaxiCompanyId ?? ""}>
            <option value="">Nessuna (da assegnare in seguito)</option>
            {taxiCompanies.map((tc) => (
              <option key={tc.id} value={tc.id}>
                {tc.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <div className="mt-2 flex gap-2">
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Salvataggio…" : "Salva modifiche"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/hotels")}>
          Annulla
        </Button>
      </div>
    </form>
  );
}
