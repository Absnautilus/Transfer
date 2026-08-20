"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cancelTransfer } from "@/app/hotel/transfer/actions";
import { TRANSFER_STATUS } from "@/lib/constants";

export function HotelRowActions({ transferId, date, status }: { transferId: string; date: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const cancelled = status === TRANSFER_STATUS.CANCELLED;

  return (
    <div className="flex items-center gap-2">
      <Link href={`/hotel/transfer/${transferId}?date=${date}`} className="text-sm font-medium text-purple-600 hover:underline">
        Modifica
      </Link>
      {!cancelled && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (!confirm("Annullare questo transfer?")) return;
            startTransition(() => cancelTransfer(transferId));
          }}
        >
          Annulla
        </Button>
      )}
    </div>
  );
}
