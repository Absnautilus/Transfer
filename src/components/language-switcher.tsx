"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CircleFlag } from "@/components/circle-flag";
import { LOCALES, LOCALE_COOKIE, LOCALE_ISO, LOCALE_LABEL, type Locale } from "@/lib/i18n/locales";
import { setCookie } from "@/lib/set-cookie";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  function onChange(next: Locale) {
    setCookie(LOCALE_COOKIE, next, 60 * 60 * 24 * 365);
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", next);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Language"
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-slate-100"
      >
        <CircleFlag iso={LOCALE_ISO[locale]} className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 inline-flex gap-1.5 rounded-full border border-slate-200 bg-white p-1.5 shadow-lg">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onChange(l)}
              aria-label={LOCALE_LABEL[l]}
              title={LOCALE_LABEL[l]}
              className={`cursor-pointer rounded-full transition-transform hover:scale-110 ${l === locale ? "ring-2 ring-purple-600 ring-offset-2" : ""}`}
            >
              <CircleFlag iso={LOCALE_ISO[l]} className="h-7 w-7" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
