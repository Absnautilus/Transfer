"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LOCALES, LOCALE_COOKIE, LOCALE_FLAG, LOCALE_LABEL, type Locale } from "@/lib/i18n/locales";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", next);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  }

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => onChange(e.target.value as Locale)}
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-600"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_FLAG[l]} {LOCALE_LABEL[l]}
        </option>
      ))}
    </select>
  );
}
