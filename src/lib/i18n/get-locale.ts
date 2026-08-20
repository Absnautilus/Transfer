import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./locales";

// Resolution order: explicit ?lang= query param (if present on the page),
// then the locale cookie set by the LanguageSwitcher, then Italian.
export async function getRequestLocale(searchParamLang?: string): Promise<Locale> {
  const cookieStore = await cookies();
  return resolveLocale(searchParamLang, cookieStore.get(LOCALE_COOKIE)?.value);
}
