"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL, type Role } from "@/lib/constants";

export type TeamMember = { id: string; name: string; email: string; role: string; isOrgAdmin: boolean };

export function TeamTable({
  members,
  currentUserId,
  onToggleAdmin,
}: {
  members: TeamMember[];
  currentUserId: string;
  onToggleAdmin: (userId: string, next: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-2">Nome</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Ruolo</th>
            <th className="px-4 py-2">Amministratore</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {members.map((m) => (
            <tr key={m.id}>
              <td className="px-4 py-2 font-medium text-slate-900">
                {m.name}
                {m.id === currentUserId && <span className="ml-1 text-xs text-slate-400">(tu)</span>}
              </td>
              <td className="px-4 py-2 text-slate-600">{m.email}</td>
              <td className="px-4 py-2 text-slate-600">{ROLE_LABEL[m.role as Role] ?? m.role}</td>
              <td className="px-4 py-2">
                <span className={m.isOrgAdmin ? "text-emerald-600" : "text-slate-400"}>{m.isOrgAdmin ? "Sì" : "No"}</span>
              </td>
              <td className="px-4 py-2">
                {m.id !== currentUserId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => startTransition(() => onToggleAdmin(m.id, !m.isOrgAdmin))}
                  >
                    {m.isOrgAdmin ? "Revoca admin" : "Rendi admin"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
