"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/field";
import { TRANSFER_STATUS } from "@/lib/constants";
import { assignDriver, confirmTransfer, rejectTransfer } from "@/app/taxi/transfer/actions";

type Driver = { id: string; name: string; active: boolean };

export function TaxiRowActions({
  transferId,
  status,
  driverId,
  drivers,
}: {
  transferId: string;
  status: string;
  driverId: string | null;
  drivers: Driver[];
}) {
  const [pending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      {status === TRANSFER_STATUS.AWAITING_TAXI && !showReject && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                try {
                  await confirmTransfer(transferId);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Errore");
                }
              })
            }
          >
            Conferma
          </Button>
          <Button size="sm" variant="danger" disabled={pending} onClick={() => setShowReject(true)}>
            Rifiuta
          </Button>
        </div>
      )}

      {showReject && (
        <form
          action={async (formData) => {
            setError(null);
            try {
              await rejectTransfer(formData);
              setShowReject(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Errore");
            }
          }}
          className="w-56"
        >
          <input type="hidden" name="transferId" value={transferId} />
          <Textarea name="reason" rows={2} placeholder="Motivo del rifiuto…" required />
          <div className="mt-1 flex justify-end gap-1">
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowReject(false)}>
              Annulla
            </Button>
            <Button type="submit" size="sm" variant="danger">
              Conferma
            </Button>
          </div>
        </form>
      )}

      <Select
        value={driverId ?? ""}
        disabled={pending}
        onChange={(e) =>
          startTransition(async () => {
            setError(null);
            try {
              await assignDriver(transferId, e.target.value);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Errore");
            }
          })
        }
        className="w-44"
      >
        <option value="">Assegna autista…</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id} disabled={!d.active}>
            {d.name}
            {!d.active ? " (non attivo)" : ""}
          </option>
        ))}
      </Select>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
