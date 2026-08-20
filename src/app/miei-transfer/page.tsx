import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PublicHeader } from "@/components/public-header";
import { LookupForm } from "./lookup-form";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionaries";

export default async function MyTransfersPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const locale = await getRequestLocale(lang);
  const dict = t(locale);
  const myTransfers = dict.myTransfers;

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <PublicHeader locale={locale} />
      <div className="mx-auto max-w-xl px-4 pt-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">{myTransfers.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{myTransfers.subtitle}</p>
        </div>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-700">{myTransfers.searchCardTitle}</h2>
          </CardHeader>
          <CardBody>
            <LookupForm dict={dict} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
