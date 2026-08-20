"use client";

import { useState, useTransition } from "react";
import { checkFlight, type FlightCheckResult } from "@/lib/check-flight-action";

export function FlightCheckButton({ flightNumber, date, time }: { flightNumber: string; date: string; time: string }) {
  const [result, setResult] = useState<FlightCheckResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onCheck() {
    setResult(null);
    startTransition(async () => {
      setResult(await checkFlight(flightNumber, date, time));
    });
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        disabled={pending}
        onClick={onCheck}
        className="text-xs font-medium text-purple-600 hover:underline disabled:text-slate-400"
      >
        {pending ? "Verifica…" : "Verifica volo"}
      </button>
      {result && (
        <p
          className={`mt-0.5 text-xs ${
            result.status === "ok" && !result.mismatch
              ? "text-emerald-600"
              : result.status === "not_configured"
                ? "text-slate-400"
                : "text-amber-600"
          }`}
        >
          {result.status === "not_configured" && "Verifica automatica non ancora attiva."}
          {result.status === "not_found" && "Volo non trovato — controlla il numero."}
          {result.status === "error" && "Verifica non riuscita."}
          {result.status === "ok" &&
            (result.mismatch
              ? `Attenzione: il volo atterra alle ${result.scheduledArrivalTime}, orario diverso da quello inserito.`
              : `Volo confermato — arrivo alle ${result.scheduledArrivalTime}.`)}
        </p>
      )}
    </div>
  );
}
