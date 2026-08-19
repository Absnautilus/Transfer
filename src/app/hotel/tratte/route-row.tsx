"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleRouteActive } from "./actions";

export function RouteRow({ route }: { route: { id: string; label: string; defaultPrice: number | null; active: boolean } }) {
  const [pending, startTransition] = useTransition();
  return (
    <tr>
      <td className="px-4 py-2 font-medium text-slate-900">{route.label}</td>
      <td className="px-4 py-2 text-slate-600">{route.defaultPrice != null ? `€ ${route.defaultPrice.toFixed(2)}` : "—"}</td>
      <td className="px-4 py-2">
        <span className={route.active ? "text-emerald-600" : "text-slate-400"}>{route.active ? "Attiva" : "Non attiva"}</span>
      </td>
      <td className="px-4 py-2">
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => startTransition(() => toggleRouteActive(route.id))}>
          {route.active ? "Disattiva" : "Riattiva"}
        </Button>
      </td>
    </tr>
  );
}
