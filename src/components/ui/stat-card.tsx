import Link from "next/link";

export function StatCard({
  label,
  value,
  accent = "var(--color-purple-600)",
  href,
}: {
  label: string;
  value: React.ReactNode;
  accent?: string;
  href?: string | null;
}) {
  const content = (
    <div
      className="rounded-lg border-t-[3px] bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5"
      style={{ borderTopColor: accent }}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
