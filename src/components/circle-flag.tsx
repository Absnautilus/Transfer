import { FlagIcon } from "@/components/flag-icon";

// country-flag-icons SVGs are 3:2. object-fit support on inline <svg> is
// inconsistent across browsers, so instead of relying on object-cover we
// oversize the flag and center it inside a clipped circle — a technique
// that always crops correctly regardless of browser SVG object-fit support.
export function CircleFlag({ iso, className }: { iso: string; className?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full ${className ?? "h-5 w-5"}`}>
      <FlagIcon iso={iso} className="absolute left-1/2 top-1/2 h-full w-[150%] -translate-x-1/2 -translate-y-1/2" />
    </span>
  );
}
