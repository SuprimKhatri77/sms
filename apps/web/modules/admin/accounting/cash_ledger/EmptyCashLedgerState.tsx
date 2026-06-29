"use client";

import { Banknote, Plus } from "lucide-react";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";

interface EmptyCashLedgerStateProps {
  onCreateEntry: () => void;
}

export function EmptyCashLedgerState({
  onCreateEntry,
}: EmptyCashLedgerStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <Banknote
        className="h-10 w-10 text-[rgba(47,78,64,0.2)]"
        strokeWidth={1.25}
      />
      <div>
        <p className="font-[family-name:var(--font-lora)] text-base font-semibold text-(--brand-ink)">
          No cash entries yet
        </p>
        <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.45)]">
          Record your first cash transaction to get started
        </p>
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
