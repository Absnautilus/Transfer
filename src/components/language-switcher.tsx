"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FlagIcon } from "@/components/flag-icon";
import { LOCALES, LOCALE_COOKIE, LOCALE_ISO, LOCALE_LABEL, type Locale } from "@/lib/i18n/locales";
import { setCookie } from "@/lib/set-cookie";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function onChange(next: Locale) {
    setCookie(LOCALE_COOKIE, next, 60 * 60 * 24 * 365);
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", next);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Language"
        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
      >
        <FlagIcon iso={LOCALE_ISO[locale]} className="h-3.5 w-5 rounded-sm" />
        {LOCALE_LABEL[locale]}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onChange(l)}
                className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm hover:bg-slate-50 ${l === locale ? "bg-purple-50 text-purple-700" : "text-slate-700"}`}
              >
                <FlagIcon iso={LOCALE_ISO[l]} className="h-3.5 w-5 shrink-0 rounded-sm" />
                {LOCALE_LABEL[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
