"use client";

import { useEffect, useRef, useState } from "react";

const SCALES = [
  { value: 1, label: "A", sizeClass: "text-xs" },
  { value: 2, label: "A", sizeClass: "text-sm" },
  { value: 3, label: "A", sizeClass: "text-base" },
] as const;
type Scale = (typeof SCALES)[number]["value"];
const STORAGE_KEY = "fromto-text-scale";

function readStoredScale(): Scale {
  if (typeof window === "undefined") return 1;
  const stored = Number(localStorage.getItem(STORAGE_KEY));
  return SCALES.some((s) => s.value === stored) ? (stored as Scale) : 1;
}

export function TextScaleToggle({ className }: { className?: string }) {
  const [scale, setScale] = useState<Scale>(readStoredScale);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-text-scale", String(scale));
  }, [scale]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function select(value: Scale) {
    setScale(value);
    localStorage.setItem(STORAGE_KEY, String(value));
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Dimensione testo" title="Dimensione testo" className={className}>
        Aa
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 flex gap-1 rounded-full border border-slate-200 bg-white p-1.5 shadow-lg">
          {SCALES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => select(s.value)}
              aria-label={`Dimensione testo ${s.value}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full font-black transition-colors ${s.sizeClass} ${
                scale === s.value ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
