"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { isValidPriceTiers, type PriceTiers } from "@/lib/pricing";
import { toggleRouteActive } from "./actions";

export function RouteRow({
  route,
}: {
  route: {
    id: string;
    pointLabel: string;
    pointCategory: string;
    transferMode: string | null;
    durationMinutes: number | null;
    priceTiers: unknown;
    active: boolean;
  };
}) {
  const [pending, startTransition] = useTransition();
  const tiers: PriceTiers | null = isValidPriceTiers(route.priceTiers) ? route.priceTiers : null;
  const dayFrom4 = tiers?.day["1-4"];

  return (
    <tr>
      <td className="px-4 py-2 font-medium text-slate-900">
        {route.pointLabel}
        <div className="text-xs font-normal text-slate-500">
          {route.pointCategory}
          {route.transferMode && ` · ${route.transferMode}`}
        </div>
      </td>
      <td className="px-4 py-2 text-slate-600">{route.durationMinutes ? `${route.durationMinutes} min` : "—"}</td>
      <td className="px-4 py-2 text-slate-600">{typeof dayFrom4 === "number" ? `da € ${dayFrom4.toFixed(2)}` : "—"}</td>
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
