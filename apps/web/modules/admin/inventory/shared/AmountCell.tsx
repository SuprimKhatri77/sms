import { formatAmount } from "../lib/utils";

// ─── AmountCell ───────────────────────────────────────────────────────────────

type AmountCellProps = {
  cents: number;
};

export function AmountCell({ cents }: AmountCellProps) {
  return (
    <span
      className="tabular-nums text-[var(--brand-ink)]"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      {formatAmount(cents)}
    </span>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
// Kept for consistency; can be extended later.

type StatusBadgeProps = {
  label: string;
  variant?: "default" | "success" | "warning" | "danger";
};

const variantClasses: Record<
  NonNullable<StatusBadgeProps["variant"]>,
  string
> = {
  default: "bg-[var(--brand-ink)]/10 text-[var(--brand-ink)]",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
};

export function StatusBadge({ label, variant = "default" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantClasses[variant]}`}
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      {label}
    </span>
  );
}
