export const LOCALES = ["it", "en", "es", "pt", "fr", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "it";

export const LOCALE_LABEL: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
};

// ISO 3166-1 alpha-2 codes used to render a colored SVG flag (country-flag-icons).
export const LOCALE_ISO: Record<Locale, string> = {
  it: "IT",
  en: "GB",
  es: "ES",
  pt: "PT",
  fr: "FR",
  de: "DE",
};

export const LOCALE_COOKIE = "locale";

export const LOCALE_INTL: Record<Locale, string> = {
  it: "it-IT",
  en: "en-GB",
  es: "es-ES",
  pt: "pt-PT",
  fr: "fr-FR",
  de: "de-DE",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(...candidates: (string | undefined | null)[]): Locale {
  for (const c of candidates) {
    if (isLocale(c)) return c;
  }
  return DEFAULT_LOCALE;
}

// Reads a { it, en, ... } JSON map (as stored on HotelRoute) with a fallback
// to Italian, then to any other populated locale, then null.
export function localizedText(value: unknown, locale: Locale): string | null {
  if (!value || typeof value !== "object") return null;
  const map = value as Partial<Record<Locale, string>>;
  if (map[locale]) return map[locale] as string;
  if (map[DEFAULT_LOCALE]) return map[DEFAULT_LOCALE] as string;
  for (const l of LOCALES) {
    if (map[l]) return map[l] as string;
  }
  return null;
}
