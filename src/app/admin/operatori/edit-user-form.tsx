"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { ROLE_LABEL, type Role } from "@/lib/constants";
import { updateUser } from "../actions";

export function EditUserForm({
  user,
}: {
  user: { id: string; name: string; email: string; role: string; isOrgAdmin: boolean; org: string | null };
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
        await updateUser(user.id, formData);
        router.push("/admin/operatori");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore");
      }
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-slate-50 p-3 text-xs">
        <div>
          <dt className="text-slate-400">Ruolo</dt>
          <dd className="font-semibold text-slate-700">{ROLE_LABEL[user.role as Role] ?? user.role}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Organizzazione</dt>
          <dd className="font-semibold text-slate-700">{user.org ?? "—"}</dd>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="name" required>
            Nome
          </Label>
          <Input id="name" name="name" defaultValue={user.name} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="email" required>
            Nome utente (o email)
          </Label>
          <Input id="email" name="email" defaultValue={user.email} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="password">Nuova password (lascia vuoto per non cambiarla)</Label>
          <Input id="password" name="password" minLength={6} placeholder="••••••••" />
        </FieldGroup>
      </div>

      {(user.role === "HOTEL_STAFF" || user.role === "TAXI_STAFF") && (
        <FieldGroup className="flex items-center">
          <Checkbox name="isOrgAdmin" defaultChecked={user.isOrgAdmin} label="Amministratore dell'organizzazione (vede contabilità, gestisce il team)" />
        </FieldGroup>
      )}

      <FieldError>{error ?? undefined}</FieldError>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/operatori")}>
          Annulla
        </Button>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Salvataggio…" : "Salva modifiche"}
        </Button>
      </div>
    </form>
  );
}
