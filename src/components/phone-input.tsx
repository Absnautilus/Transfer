"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui/field";
import { DEFAULT_PHONE_PREFIX, PHONE_PREFIXES } from "@/lib/phone-prefixes";

export function PhoneInput({
  name,
  required,
  defaultPrefix = DEFAULT_PHONE_PREFIX,
  defaultNumber = "",
}: {
  name: string;
  required?: boolean;
  defaultPrefix?: string;
  defaultNumber?: string;
}) {
  const [prefix, setPrefix] = useState(defaultPrefix);
  const [number, setNumber] = useState(defaultNumber);

  return (
    <div className="flex gap-2">
      <Select value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-40 shrink-0">
        {PHONE_PREFIXES.map((p) => (
          <option key={p.code} value={p.code}>
            {p.code} {p.country}
          </option>
        ))}
      </Select>
      <Input
        type="tel"
        inputMode="tel"
        placeholder="333 1234567"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        required={required}
        className="flex-1"
      />
      <input type="hidden" name={name} value={number.trim() ? `${prefix} ${number.trim()}` : ""} />
    </div>
  );
}
