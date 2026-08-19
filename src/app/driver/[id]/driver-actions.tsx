"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { TRIP_EVENT, type TripEvent } from "@/lib/constants";
import { addTripEvent } from "../actions";

export function DriverTripActions({ transferId, reached }: { transferId: string; reached: Set<string> }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyEvent, setBusyEvent] = useState<TripEvent | null>(null);

  function trigger(event: TripEvent) {
    setError(null);
    setBusyEvent(event);
    startTransition(async () => {
      try {
        await addTripEvent(transferId, event);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Errore");
      }
    });
  }

  const steps: { event: TripEvent; label: string; variant: "outline" | "secondary" | "primary" }[] = [
    { event: TRIP_EVENT.EN_ROUTE, label: "Sono in arrivo", variant: "outline" },
    { event: TRIP_EVENT.ARRIVED, label: "Arrivato al punto di ritiro", variant: "outline" },
    { event: TRIP_EVENT.STARTED, label: "Inizia transfer", variant: "secondary" },
    { event: TRIP_EVENT.COMPLETED, label: "Termina transfer", variant: "primary" },
  ];

  return (
    <div className="space-y-2">
      {steps.map((s) => (
        <Button
          key={s.event}
          variant={s.variant}
          disabled={pending || reached.has(s.event)}
          onClick={() => trigger(s.event)}
          className="w-full"
        >
          {reached.has(s.event) ? "✓ " : ""}
          {pending && busyEvent === s.event ? "…" : s.label}
        </Button>
      ))}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
