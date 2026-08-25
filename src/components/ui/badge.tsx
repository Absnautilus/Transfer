import { cn } from "@/lib/cn";
import { TRANSFER_STATUS, TRANSFER_STATUS_LABEL, type TransferStatus } from "@/lib/constants";

const colors: Record<TransferStatus, string> = {
  AWAITING_TAXI: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  REJECTED_BY_TAXI: "bg-red-100 text-red-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  const key = (status in colors ? status : TRANSFER_STATUS.AWAITING_TAXI) as TransferStatus;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", colors[key])}>
      {TRANSFER_STATUS_LABEL[key]}
    </span>
  );
}

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700", className)}>
      {children}
    </span>
  );
}
