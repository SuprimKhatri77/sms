"use client";

import { Plus } from "lucide-react";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";

interface LedgerPageHeaderProps {
  title: string;
  subtitle?: string;
  onCreateEntry: () => void;
}

export function LedgerPageHeader({
  title,
  subtitle,
  onCreateEntry,
}: LedgerPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[rgba(47,78,64,0.12)] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(47,78,64,0.45)]">
          Admin
        </p>
        <h1 className="font-[family-name:var(--font-lora)] text-[1.75rem] font-bold tracking-tight text-(--brand-green)">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-2xl font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
            {subtitle}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onCreateEntry}
        className={adminPrimaryButtonClass}
      >
        <Plus size={15} strokeWidth={2.5} />
        New Entry
      </button>
    </div>
  );
}
