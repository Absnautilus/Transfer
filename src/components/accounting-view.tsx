import { DateField } from "@/components/ui/date-field";

type Row = {
  id: string;
  date: string;
  guestFirstName: string;
  guestLastName: string;
  price: number | null;
  priceAdjustmentType: string | null;
  priceAdjustmentAmount: number | null;
  commissionRateSnapshot: number | null;
};

function computeRow(r: Row) {
  const adjustment =
    r.priceAdjustmentType === "SURCHARGE"
      ? (r.priceAdjustmentAmount ?? 0)
      : r.priceAdjustmentType === "DISCOUNT"
        ? -(r.priceAdjustmentAmount ?? 0)
        : 0;
  const finalPrice = r.price != null ? r.price + adjustment : null;
  const commission = finalPrice != null && r.commissionRateSnapshot != null ? (finalPrice * r.commissionRateSnapshot) / 100 : null;
  const net = finalPrice != null && commission != null ? finalPrice - commission : null;
  return { finalPrice, commission, net };
}

export function AccountingView({ rows, from, to }: { rows: Row[]; from: string; to: string }) {
  const totals = rows.reduce(
    (acc, r) => {
      const { finalPrice, commission, net } = computeRow(r);
      acc.price += finalPrice ?? 0;
      acc.commission += commission ?? 0;
      acc.net += net ?? 0;
      return acc;
    },
    { price: 0, commission: 0, net: 0 },
  );

  return (
    <div>
      <form className="mb-4 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Dal</label>
          <DateField name="from" defaultValue={from} className="w-36" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Al</label>
          <DateField name="to" defaultValue={to} className="w-36" />
        </div>
        <button type="submit" className="rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700">
          Filtra
        </button>
      </form>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">Fatturato transfer</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">€ {totals.price.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">Provvigione totale</p>
          <p className="mt-1 text-2xl font-semibold text-purple-600">€ {totals.commission.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">Netto compagnia taxi</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">€ {totals.net.toFixed(2)}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Ospite</th>
              <th className="px-3 py-2">Prezzo</th>
              <th className="px-3 py-2">Provvigione</th>
              <th className="px-3 py-2">Netto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  Nessun transfer completato nel periodo selezionato.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const { finalPrice, commission, net } = computeRow(r);
              return (
                <tr key={r.id}>
                  <td className="px-3 py-2 text-slate-600">{r.date}</td>
                  <td className="px-3 py-2">
                    {r.guestFirstName} {r.guestLastName}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {finalPrice != null ? `€ ${finalPrice.toFixed(2)}` : "—"}
                    {r.priceAdjustmentType && r.priceAdjustmentType !== "NONE" && (
                      <span className="ml-1 text-xs text-slate-400">
                        ({r.priceAdjustmentType === "DISCOUNT" ? "sconto" : "maggiorazione"} € {(r.priceAdjustmentAmount ?? 0).toFixed(2)})
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{commission != null ? `€ ${commission.toFixed(2)}` : "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{net != null ? `€ ${net.toFixed(2)}` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
