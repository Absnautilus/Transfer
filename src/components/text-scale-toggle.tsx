"use client";

import { useEffect, useState } from "react";

const SCALES = [1, 2, 3] as const;
const STORAGE_KEY = "fromto-text-scale";

function readStoredScale(): (typeof SCALES)[number] {
  if (typeof window === "undefined") return 1;
  const stored = Number(localStorage.getItem(STORAGE_KEY));
  return SCALES.includes(stored as (typeof SCALES)[number]) ? (stored as (typeof SCALES)[number]) : 1;
}

export function TextScaleToggle({ className }: { className?: string }) {
  const [scale, setScale] = useState<(typeof SCALES)[number]>(readStoredScale);

  useEffect(() => {
    document.documentElement.setAttribute("data-text-scale", String(scale));
  }, [scale]);

  function cycle() {
    const next = SCALES[(SCALES.indexOf(scale) + 1) % SCALES.length];
    setScale(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  return (
    <button type="button" onClick={cycle} aria-label="Dimensione testo" title="Dimensione testo" className={className}>
      Aa
    </button>
  );
}
