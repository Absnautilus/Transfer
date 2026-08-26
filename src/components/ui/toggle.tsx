import { cn } from "@/lib/cn";

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-sm text-slate-900 select-none", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-[23px] w-10 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-45",
          checked ? "bg-purple-600" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute top-[2.5px] left-[2.5px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform",
            checked && "translate-x-[17px]",
          )}
        />
      </button>
      {label}
    </span>
  );
}
