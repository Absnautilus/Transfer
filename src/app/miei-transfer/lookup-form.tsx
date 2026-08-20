"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label } from "@/components/ui/field";
import { REQUEST_STATUS } from "@/lib/constants";
import type { dictionaries } from "@/lib/i18n/dictionaries";
import { lookupMyTransfers, type MyRequest, type MyTransfer } from "./actions";

type Dict = (typeof dictionaries)["it"];

function DetailRow({
  pax,
  bagsCabin,
  bagsStandard,
  bagsLarge,
  flightOrTrainNumber,
  flightOrTrainOrigin,
  notes,
  price,
  dict,
}: {
  pax: number;
  bagsCabin: number;
  bagsStandard: number;
  bagsLarge: number;
  flightOrTrainNumber: string | null;
  flightOrTrainOrigin: string | null;
  notes: string | null;
  price: number | null;
  dict: Dict;
}) {
  const totalBags = bagsCabin + bagsStandard + bagsLarge;
  return (
    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-sm text-slate-600 sm:grid-cols-4">
      <div>
        <dt className="text-xs text-slate-400">{dict.guestForm.pax}</dt>
        <dd>
          {pax} {totalBags > 0 && `· ${totalBags} ${dict.guestForm.bagsLabel.toLowerCase()}`}
        </dd>
      </div>
      {price != null && (
        <div>
          <dt className="text-xs text-slate-400">{dict.myTransfers.priceLabel}</dt>
          <dd>€ {price.toFixed(2)}</dd>
        </div>
      )}
      {(flightOrTrainNumber || flightOrTrainOrigin) && (
        <div>
          <dt className="text-xs text-slate-400">{dict.myTransfers.flightTrainLabel}</dt>
          <dd>
            {flightOrTrainNumber} {flightOrTrainOrigin && `· ${flightOrTrainOrigin}`}
          </dd>
        </div>
      )}
      {notes && (
        <div className="col-span-2 sm:col-span-4">
          <dt className="text-xs text-slate-400">{dict.guestForm.notesLabel}</dt>
          <dd>{notes}</dd>
        </div>
      )}
    </dl>
  );
}

export function LookupForm({ dict }: { dict: Dict }) {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [results, setResults] = useState<{ transfers: MyTransfer[]; requests: MyRequest[] } | null>(null);
  const myTransfers = dict.myTransfers;

  function runLookup(email: string, surname: string) {
    startTransition(async () => {
      setError(null);
      const formData = new FormData();
      formData.set("email", email);
      formData.set("surname", surname);
      const result = await lookupMyTransfers(formData);
      if (!result.ok) {
        setError(result.error);
        setResults(null);
        return;
      }
      setResults({ transfers: result.transfers, requests: result.requests });
    });
  }

  useEffect(() => {
    const email = searchParams.get("email");
    const surname = searchParams.get("surname");
    if (email && surname) runLookup(email, surname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    runLookup(String(formData.get("email") ?? ""), String(formData.get("surname") ?? ""));
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <FieldGroup className="mb-0 flex-1">
          <Label htmlFor="email" required>
            {myTransfers.email}
          </Label>
          <Input id="email" name="email" type="email" defaultValue={searchParams.get("email") ?? ""} required />
        </FieldGroup>
        <FieldGroup className="mb-0 flex-1">
          <Label htmlFor="surname" required>
            {myTransfers.surname}
          </Label>
          <Input id="surname" name="surname" defaultValue={searchParams.get("surname") ?? ""} required />
        </FieldGroup>
        <Button type="submit" disabled={pending} className="mb-4 sm:mb-0">
          {pending ? myTransfers.searchButtonPending : myTransfers.searchButton}
        </Button>
      </form>
      <FieldError>{error ?? undefined}</FieldError>

      {results && (
        <div className="mt-6 space-y-3">
          {results.transfers.length === 0 && results.requests.length === 0 && (
            <p className="text-sm text-slate-500">{myTransfers.noResults}</p>
          )}

          {results.transfers.map((t) => (
            <Link
              key={t.id}
              href={`/traccia/${t.guestTrackingToken}`}
              className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {t.date} · {t.time}
                  </p>
                  <p className="font-medium text-slate-900">
                    {t.routeFrom} → {t.routeTo}
                  </p>
                </div>
                <span className="text-sm font-medium text-purple-700">{myTransfers.status[t.statusBucket]}</span>
              </div>
              <DetailRow
                pax={t.pax}
                bagsCabin={t.bagsCabin}
                bagsStandard={t.bagsStandard}
                bagsLarge={t.bagsLarge}
                flightOrTrainNumber={t.flightOrTrainNumber}
                flightOrTrainOrigin={t.flightOrTrainOrigin}
                notes={t.notes}
                price={t.price}
                dict={dict}
              />
            </Link>
          ))}

          {results.requests.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {r.date} · {r.time}
                  </p>
                  <p className="font-medium text-slate-900">
                    {r.routeFrom} → {r.routeTo}
                  </p>
                </div>
                <span className={r.status === REQUEST_STATUS.REJECTED ? "text-sm text-red-600" : "text-sm text-amber-600"}>
                  {r.status === REQUEST_STATUS.REJECTED ? myTransfers.statusRejected : myTransfers.statusPending}
                </span>
              </div>
              <DetailRow
                pax={r.pax}
                bagsCabin={r.bagsCabin}
                bagsStandard={r.bagsStandard}
                bagsLarge={r.bagsLarge}
                flightOrTrainNumber={r.flightOrTrainNumber}
                flightOrTrainOrigin={r.flightOrTrainOrigin}
                notes={r.notes}
                price={r.quotedPrice}
                dict={dict}
              />
              {r.rejectionReason && (
                <p className="mt-2 text-sm text-slate-600">
                  {myTransfers.reasonLabel} {r.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
