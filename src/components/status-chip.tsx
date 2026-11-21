type StatusChipProps = {
  status: string;
};

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  POSTED: { label: "Posted", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  CLAIMED: { label: "Claimed", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  COLLECTED: { label: "Collected", className: "bg-violet-50 text-violet-700 ring-violet-200" },
  DELIVERED: { label: "Delivered", className: "bg-green-50 text-green-700 ring-green-200" },
  EXPIRED: { label: "Expired", className: "bg-rose-50 text-rose-700 ring-rose-200" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export function StatusChip({ status }: StatusChipProps) {
  const style = STATUS_STYLES[status];
  const label = style?.label ?? status.charAt(0) + status.slice(1).toLowerCase();
  const className = style?.className ?? "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}
