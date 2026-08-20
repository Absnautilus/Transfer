"use client";

import { useState } from "react";
import { Input } from "@/components/ui/field";
import { FlagIcon } from "@/components/flag-icon";
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
  const [open, setOpen] = useState(false);
  const current = PHONE_PREFIXES.find((p) => p.code === prefix) ?? PHONE_PREFIXES[0];

  return (
    <div className="flex min-w-0 gap-2">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-full items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50"
        >
          <FlagIcon iso={current.iso} className="h-3.5 w-5 rounded-sm" />
          {current.code}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-0 z-20 mt-1 max-h-64 w-56 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
              {PHONE_PREFIXES.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => {
                    setPrefix(p.code);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm hover:bg-slate-50"
                >
                  <FlagIcon iso={p.iso} className="h-3.5 w-5 shrink-0 rounded-sm" />
                  <span className="flex-1 truncate text-slate-700">{p.country}</span>
                  <span className="text-slate-400">{p.code}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <Input
        type="tel"
        inputMode="tel"
        placeholder="333 1234567"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        required={required}
        className="min-w-0 flex-1"
      />
      <input type="hidden" name={name} value={number.trim() ? `${prefix} ${number.trim()}` : ""} />
    </div>
  );
}
