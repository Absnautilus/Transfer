"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label } from "@/components/ui/field";
import { createRoute } from "./actions";

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
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <FieldGroup className="mb-0 flex-1 min-w-[240px]">
        <Label htmlFor="label" required>
          Tratta
        </Label>
        <Input id="label" name="label" placeholder="es. SAN BASILIO >>> VCE" required />
      </FieldGroup>
      <FieldGroup className="mb-0 w-32">
        <Label htmlFor="defaultPrice">Prezzo (€)</Label>
        <Input id="defaultPrice" name="defaultPrice" type="number" step="0.01" />
      </FieldGroup>
      <Button type="submit" variant="secondary" disabled={pending} className="mb-4">
        {pending ? "Aggiunta…" : "Aggiungi"}
      </Button>
      <div className="w-full">
        <FieldError>{error ?? undefined}</FieldError>
      </div>
    </form>
  );
}
