"use client";

import { useEffect, useRef, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { it } from "date-fns/locale";

const DOW = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function safeParse(value: string | undefined): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function DateField({
  id,
  name,
  value,
  defaultValue,
  onChange,
  required,
  className,
}: {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  className?: string;
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = isControlled ? value : internal;

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => safeParse(current) ?? new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openPopover() {
    setViewMonth(safeParse(current) ?? new Date());
    setOpen(true);
  }

  function select(day: Date) {
    const iso = format(day, "yyyy-MM-dd");
    if (!isControlled) setInternal(iso);
    onChange?.(iso);
    setOpen(false);
  }

  const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const selectedDate = safeParse(current);

  return (
    <div className={`relative ${className ?? ""}`} ref={ref}>
      {name && <input type="hidden" name={name} value={current} required={required} />}
      <button
        id={id}
        type="button"
        onClick={() => (open ? setOpen(false) : openPopover())}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 shadow-sm hover:border-slate-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        <span className={selectedDate ? "" : "text-slate-400"}>
          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Seleziona data"}
        </span>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-slate-400" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-[266px] rounded-lg border border-slate-200 bg-white p-3.5 shadow-lg">
          <div className="mb-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Mese precedente"
            >
              ‹
            </button>
            <span className="text-[13px] font-extrabold capitalize text-slate-900">{format(viewMonth, "LLLL yyyy", { locale: it })}</span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Mese successivo"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {DOW.map((d) => (
              <div key={d} className="pb-1.5 text-center text-[9px] font-extrabold uppercase text-slate-400">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const inMonth = isSameMonth(day, viewMonth);
              const selected = selectedDate ? isSameDay(day, selectedDate) : false;
              const today = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => select(day)}
                  className={`aspect-square cursor-pointer rounded-lg text-center font-mono text-[11.5px] transition-colors ${
                    selected
                      ? "bg-purple-600 font-bold text-white"
                      : today
                        ? "font-bold text-purple-600 ring-[1.5px] ring-inset ring-purple-600"
                        : inMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
