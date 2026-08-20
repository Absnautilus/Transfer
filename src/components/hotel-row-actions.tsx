"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/field";
import { cancelTransfer } from "@/app/hotel/transfer/actions";
import { TRANSFER_STATUS } from "@/lib/constants";

export function HotelRowActions({ transferId, date, status }: { transferId: string; date: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [showCancel, setShowCancel] = useState(false);
  const [penaltyType, setPenaltyType] = useState<"NONE" | "FULL" | "PARTIAL">("NONE");
  const [error, setError] = useState<string | null>(null);
  const cancelled = status === TRANSFER_STATUS.CANCELLED;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-2">
        <Link href={`/hotel/transfer/${transferId}?date=${date}`} className="text-sm font-medium text-purple-600 hover:underline">
          Modifica
        </Link>
        {!cancelled && !showCancel && (
          <Button size="sm" variant="ghost" onClick={() => setShowCancel(true)}>
            Annulla
          </Button>
        )}
      </div>

      {showCancel && (
        <form
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              try {
                await cancelTransfer(formData);
                setShowCancel(false);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Errore");
              }
            });
          }}
          className="w-64 rounded-md border border-slate-200 bg-slate-50 p-2"
        >
          <input type="hidden" name="transferId" value={transferId} />
          <Textarea name="cancellationReason" rows={2} placeholder="Motivo dell'annullamento…" className="mb-2 text-xs" />
          <Select
            name="penaltyType"
            value={penaltyType}
            onChange={(e) => setPenaltyType(e.target.value as typeof penaltyType)}
            className="mb-2 text-xs"
          >
            <option value="NONE">Nessuna penale</option>
            <option value="FULL">Penale totale</option>
            <option value="PARTIAL">Penale parziale</option>
          </Select>
          {penaltyType === "PARTIAL" && (
            <Input
              name="penaltyAmount"
              type="number"
              min={0}
              step="0.01"
              placeholder="Importo penale (€)"
              className="mb-2 text-xs"
              required
            />
          )}
          {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-1">
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowCancel(false)}>
              Chiudi
            </Button>
            <Button type="submit" size="sm" variant="danger" disabled={pending}>
              Conferma annullamento
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
