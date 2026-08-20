"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/badge";
import { REQUEST_STATUS } from "@/lib/constants";
import type { dictionaries } from "@/lib/i18n/dictionaries";
import { lookupMyTransfers, type MyRequest, type MyTransfer } from "./actions";

type Dict = (typeof dictionaries)["it"]["myTransfers"];

export function LookupForm({ dict }: { dict: Dict }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [results, setResults] = useState<{ transfers: MyTransfer[]; requests: MyRequest[] } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await lookupMyTransfers(formData);
      if (!result.ok) {
        setError(result.error);
        setResults(null);
        return;
      }
      setResults({ transfers: result.transfers, requests: result.requests });
    });
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <FieldGroup className="mb-0 flex-1">
          <Label htmlFor="email" required>
            {dict.email}
          </Label>
          <Input id="email" name="email" type="email" required />
        </FieldGroup>
        <FieldGroup className="mb-0 flex-1">
          <Label htmlFor="surname" required>
            {dict.surname}
          </Label>
          <Input id="surname" name="surname" required />
        </FieldGroup>
        <Button type="submit" disabled={pending} className="mb-4 sm:mb-0">
          {pending ? dict.searchButtonPending : dict.searchButton}
        </Button>
      </form>
      <FieldError>{error ?? undefined}</FieldError>

      {results && (
        <div className="mt-6 space-y-3">
          {results.transfers.length === 0 && results.requests.length === 0 && (
            <p className="text-sm text-slate-500">{dict.noResults}</p>
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
                <StatusBadge status={t.status} />
              </div>
            </Link>
          ))}

          {results.requests.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {r.date} · {r.time}
                  </p>
                  <p className="font-medium text-slate-900">{dict.requestLabel}</p>
                </div>
                <span className={r.status === REQUEST_STATUS.REJECTED ? "text-sm text-red-600" : "text-sm text-amber-600"}>
                  {r.status === REQUEST_STATUS.REJECTED ? dict.statusRejected : dict.statusPending}
                </span>
              </div>
              {r.rejectionReason && (
                <p className="mt-2 text-sm text-slate-600">
                  {dict.reasonLabel} {r.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
