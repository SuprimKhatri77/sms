import type { ReactNode } from "react";

type InventoryPageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function InventoryPageHeader({
  title,
  description,
  action,
}: InventoryPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
      <div className="space-y-1">
        <h1
          className="text-2xl sm:text-3xl font-bold text-[var(--brand-ink)] tracking-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {title}
        </h1>
        <p
          className="text-sm text-[var(--brand-ink)]/60"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {description}
        </p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
