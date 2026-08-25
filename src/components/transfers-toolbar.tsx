"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { DateField } from "@/components/ui/date-field";
import { todayISO } from "@/lib/date";

export function TransfersToolbar({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitDate = searchParams.get("date");
  const isUpcoming = !explicitDate && !searchParams.get("q");
  const date = explicitDate ?? todayISO();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function goTo(nextDate: string) {
    router.push(`${basePath}?date=${nextDate}`);
  }

  function goToUpcoming() {
    setQ("");
    router.push(basePath);
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`${basePath}?q=${encodeURIComponent(q.trim())}`);
    else goToUpcoming();
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        <Button
          variant={isUpcoming ? "secondary" : "ghost"}
          size="sm"
          onClick={goToUpcoming}
        >
          Prossimi
        </Button>
        <Button variant="outline" size="sm" onClick={() => goTo(format(addDays(parseISO(date), -1), "yyyy-MM-dd"))}>
          ← Ieri
        </Button>
        <DateField value={date} onChange={goTo} className="w-40" />
        <Button variant="outline" size="sm" onClick={() => goTo(format(addDays(parseISO(date), 1), "yyyy-MM-dd"))}>
          Domani →
        </Button>
        <Button variant={!isUpcoming && date === todayISO() ? "secondary" : "ghost"} size="sm" onClick={() => goTo(todayISO())}>
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
          <Button type="button" variant="ghost" size="sm" onClick={goToUpcoming}>
            Reset
          </Button>
        )}
      </form>
    </div>
  );
}
