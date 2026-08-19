import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { TransferForm } from "../transfer-form";
import { createManualTransfer } from "../actions";
import { todayISO } from "@/lib/transfers";

export default function NewTransferPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Nuovo transfer</h1>
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Inserimento manuale</h2>
        </CardHeader>
        <CardBody>
          <TransferForm initial={{ guestName: "", pax: 1, date: todayISO(), time: "09:00", isNightService: false, routeFrom: "", routeTo: "" }} action={createManualTransfer} submitLabel="Crea transfer" />
        </CardBody>
      </Card>
    </div>
  );
}
