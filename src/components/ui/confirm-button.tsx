"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmButton({
  label,
  confirmLabel = "Conferma",
  title,
  description,
  variant = "danger",
  size = "sm",
  onConfirm,
  className,
}: {
  label: React.ReactNode;
  confirmLabel?: string;
  title: string;
  description?: string;
  variant?: "danger" | "primary";
  size?: "sm" | "md";
  onConfirm: () => Promise<void>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div className="w-full max-w-[320px] rounded-xl bg-white p-7 pb-6 text-center shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div
              className={`mx-auto mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-full ${
                variant === "danger" ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {variant === "danger" ? (
                  <>
                    <path d="M12 9v4M12 17h.01" />
                    <path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L14 3.9a2 2 0 0 0-3.4 0Z" />
                  </>
                ) : (
                  <path d="M4 12l5 5L20 6" />
                )}
              </svg>
            </div>
            <p className="text-[15.5px] font-extrabold text-slate-900">{title}</p>
            {description && <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>}
            {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
            <div className="mt-5 flex gap-2">
              <Button type="button" variant="ghost" size="sm" className="flex-1 justify-center" disabled={pending} onClick={() => setOpen(false)}>
                Annulla
              </Button>
              <Button
                type="button"
                variant={variant}
                size="sm"
                className="flex-1 justify-center"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    try {
                      await onConfirm();
                      setOpen(false);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Errore");
                    }
                  })
                }
              >
                {pending ? "…" : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
