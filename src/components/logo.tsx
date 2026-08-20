export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M11 33 C11 22, 18 15, 24 15 C30 15, 37 22, 37 33" stroke="#7c3aed" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="24" cy="14" r="7" fill="#7c3aed" />
      <circle cx="10.5" cy="34.5" r="5.5" fill="#1e1b2e" />
      <circle cx="37.5" cy="34.5" r="5.5" fill="#1e1b2e" />
    </svg>
  );
}

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className="h-6 w-6" />
      <span className={textClassName ?? "font-semibold text-slate-900"}>Hotel Transfer</span>
    </span>
  );
}
