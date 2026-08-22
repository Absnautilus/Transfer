import Link from "next/link";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/lib/i18n/locales";

export function PublicHeader({ locale }: { locale?: Locale }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-6">
      <Link href="/" className="hover:opacity-80">
        <Logo />
      </Link>
      <div className="flex items-center gap-4">
        {locale && <LanguageSwitcher locale={locale} />}
        <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600">
          Sei un operatore?
        </Link>
      </div>
    </div>
  );
}
