"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { todayISO } from "@/lib/date";

export function TransfersToolbar({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? todayISO();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function goTo(nextDate: string) {
    router.push(`${basePath}?date=${nextDate}`);
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`${basePath}?q=${encodeURIComponent(q.trim())}`);
    else router.push(`${basePath}?date=${date}`);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => goTo(format(addDays(parseISO(date), -1), "yyyy-MM-dd"))}>
          ← Ieri
        </Button>
        <Input type="date" value={date} onChange={(e) => goTo(e.target.value)} className="w-40" />
        <Button variant="outline" size="sm" onClick={() => goTo(format(addDays(parseISO(date), 1), "yyyy-MM-dd"))}>
          Domani →
        </Button>
        <Button variant="ghost" size="sm" onClick={() => goTo(todayISO())}>
          Oggi
        </Button>
      </div>
      <form onSubmit={onSearchSubmit} className="flex flex-1 min-w-[220px] gap-2">
        <Input
          placeholder="Cerca per nome, camera o numero prenotazione…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline" size="sm">
          Cerca
        </Button>
        {searchParams.get("q") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("");
              goTo(todayISO());
            }}
          >
            Reset
          </Button>
        )}
      </form>
    </div>
  );
}
