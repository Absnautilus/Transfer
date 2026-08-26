"use client";

import { Children, isValidElement, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactElement, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type OptionProps = { value?: string; disabled?: boolean; children?: React.ReactNode };

export function Select({
  children,
  className,
  value,
  defaultValue,
  onChange,
  name,
  id,
  required,
  disabled,
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter((c): c is ReactElement<OptionProps> => isValidElement(c))
        .map((c) => ({
          value: c.props.value ?? "",
          label: c.props.children,
          disabled: c.props.disabled ?? false,
        })),
    [children],
  );

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState((defaultValue as string) ?? options[0]?.value ?? "");
  const current = isControlled ? ((value as string) ?? "") : internal;
  const currentOption = options.find((o) => o.value === current);

  const [open, setOpen] = useState(false);
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

  function selectValue(v: string) {
    if (!isControlled) setInternal(v);
    if (onChange) onChange({ target: { value: v, name } } as unknown as ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      {name && <input type="hidden" name={name} value={current} required={required} />}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 shadow-sm hover:border-slate-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-slate-100",
          className,
        )}
      >
        <span className={`truncate ${currentOption ? "" : "text-slate-400"}`}>{currentOption?.label ?? "Seleziona…"}</span>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-slate-400" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 max-h-64 w-full min-w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              disabled={o.disabled}
              onClick={() => selectValue(o.value)}
              className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:text-slate-400 ${
                o.value === current ? "bg-purple-50 font-semibold text-purple-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="truncate">{o.label}</span>
              {o.value === current && (
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0 text-purple-600" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
