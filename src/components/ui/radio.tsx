import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

export function Radio({
  label,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: React.ReactNode }) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-slate-700 select-none",
        props.disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
        className,
      )}
    >
      <input type="radio" className="sr-only" {...props} />
      <span
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
          props.checked ? "border-purple-600" : "border-slate-300",
        )}
      >
        <span className={cn("h-2 w-2 rounded-full bg-purple-600 transition-transform", props.checked ? "scale-100" : "scale-0")} />
      </span>
      {label}
    </label>
  );
}
