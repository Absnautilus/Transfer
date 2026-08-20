"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label } from "@/components/ui/field";
import { createAdminUser } from "../actions";

export function AdminUserForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createAdminUser(formData);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
      <FieldGroup>
        <Label htmlFor="name" required>
          Nome
        </Label>
        <Input id="name" name="name" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input id="email" name="email" type="email" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="password" required>
          Password provvisoria
        </Label>
        <Input id="password" name="password" minLength={6} required />
      </FieldGroup>
      <div className="col-span-full">
        <FieldError>{error ?? undefined}</FieldError>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Creazione…" : "Aggiungi amministratore"}
        </Button>
      </div>
    </form>
  );
}
