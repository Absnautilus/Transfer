import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PublicHeader } from "@/components/public-header";
import { LookupForm } from "./lookup-form";

export default function MyTransfersPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <PublicHeader />
      <div className="mx-auto max-w-xl px-4 pt-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">I tuoi transfer</h1>
          <p className="mt-1 text-sm text-slate-500">
            Inserisci l&apos;email e il cognome usati nella richiesta per vedere lo stato dei tuoi transfer.
          </p>
        </div>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-700">Cerca la tua prenotazione</h2>
          </CardHeader>
          <CardBody>
            <LookupForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
