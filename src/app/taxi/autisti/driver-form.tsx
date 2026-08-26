"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label } from "@/components/ui/field";
import { createDriver } from "./actions";

export function DriverForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createDriver(formData);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      <FieldGroup>
        <Label htmlFor="name" required>
          Nome autista
        </Label>
        <Input id="name" name="name" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="phone" required>
          Telefono
        </Label>
        <Input id="phone" name="phone" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="vehicleInfo">Veicolo</Label>
        <Input id="vehicleInfo" name="vehicleInfo" placeholder="es. Mercedes Classe V, targa AB123CD" />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="email" required>
          Email di accesso
        </Label>
        <Input id="email" name="email" type="email" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="password" required>
          Password provvisoria
        </Label>
        <Input id="password" name="password" type="text" minLength={6} required />
      </FieldGroup>
      <div className="col-span-2">
        <FieldError>{error ?? undefined}</FieldError>
        <div className="mt-2 flex justify-end">
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Creazione…" : "Aggiungi autista"}
          </Button>
        </div>
      </div>
    </form>
  );
}
