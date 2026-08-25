"use client";

import { useTransition } from "react";
import { Toggle } from "@/components/ui/toggle";
import { toggleDriverActive } from "./actions";

export function DriverRow({ driver }: { driver: { id: string; name: string; phone: string; vehicleInfo: string | null; active: boolean } }) {
  const [pending, startTransition] = useTransition();
  return (
    <tr>
      <td className="px-4 py-2 font-medium text-slate-900">{driver.name}</td>
      <td className="px-4 py-2 text-slate-600">{driver.phone}</td>
      <td className="px-4 py-2 text-slate-600">{driver.vehicleInfo || "—"}</td>
      <td className="px-4 py-2">
        <Toggle
          checked={driver.active}
          disabled={pending}
          onChange={() => startTransition(() => toggleDriverActive(driver.id))}
          label={<span className={driver.active ? "text-emerald-600" : "text-slate-400"}>{driver.active ? "Attivo" : "Non attivo"}</span>}
        />
      </td>
    </tr>
  );
}
