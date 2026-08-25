"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Indietro"
      className={cn("shrink-0 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer", className)}
    >
      ← <span className="hidden sm:inline">Indietro</span>
    </button>
  );
}
