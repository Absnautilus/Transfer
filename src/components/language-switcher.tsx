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
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
      >
        <span className="block h-5 w-5 shrink-0 overflow-hidden rounded-full">
          <FlagIcon iso={LOCALE_ISO[locale]} className="h-full w-full object-cover" />
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 inline-flex gap-1.5 rounded-full border border-slate-200 bg-white p-1.5 shadow-lg">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onChange(l)}
                aria-label={LOCALE_LABEL[l]}
                title={LOCALE_LABEL[l]}
                className={`relative h-7 w-7 shrink-0 overflow-hidden rounded-full transition-transform hover:scale-110 ${
                  l === locale ? "outline outline-2 outline-offset-2 outline-purple-600" : ""
                }`}
              >
                <FlagIcon iso={LOCALE_ISO[l]} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
