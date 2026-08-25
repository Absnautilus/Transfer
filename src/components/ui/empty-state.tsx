export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon ?? (
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
            <path d="M3 8l3.6-4.8A2 2 0 0 1 8.2 2h7.6a2 2 0 0 1 1.6 1.2L21 8" />
            <path d="M3 8h18" />
            <path d="M9 12a3 3 0 0 0 6 0" />
          </svg>
        )}
      </span>
      <p className="text-sm font-bold text-slate-900">{title}</p>
      {description && <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-slate-500">{description}</p>}
    </div>
  );
}
