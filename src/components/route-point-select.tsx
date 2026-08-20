"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui/field";

const OTHER = "__ALTRO__";

export function RoutePointSelect({ name, points, defaultValue }: { name: string; points: string[]; defaultValue?: string }) {
  const knownValue = defaultValue && points.includes(defaultValue) ? defaultValue : "";
  const [mode, setMode] = useState<"known" | "other">(defaultValue && !knownValue ? "other" : "known");
  const [selected, setSelected] = useState(knownValue || points[0] || "");
  const [customValue, setCustomValue] = useState(mode === "other" ? (defaultValue ?? "") : "");

  const finalValue = mode === "other" ? customValue : selected;

  return (
    <div>
      <Select
        value={mode === "other" ? OTHER : selected}
        onChange={(e) => {
          if (e.target.value === OTHER) {
            setMode("other");
          } else {
            setMode("known");
            setSelected(e.target.value);
          }
        }}
      >
        {points.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
        <option value={OTHER}>Altro…</option>
      </Select>
      {mode === "other" && (
        <Input
          className="mt-2"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="Specifica il punto"
          required
        />
      )}
      <input type="hidden" name={name} value={finalValue} />
    </div>
  );
}
