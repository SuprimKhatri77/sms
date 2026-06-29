"use client";

import { BookOpen, Plus } from "lucide-react";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";

interface EmptyLedgerStateProps {
  onCreateEntry: () => void;
}

export function EmptyLedgerState({ onCreateEntry }: EmptyLedgerStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <BookOpen
        className="h-10 w-10 text-[rgba(47,78,64,0.2)]"
        strokeWidth={1.25}
      />
      <div>
        <p className="font-[family-name:var(--font-lora)] text-base font-semibold text-(--brand-ink)">
          No ledger entries yet
        </p>
        <p className="mt-1 max-w-xs font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.45)]">
          No financial transactions have been recorded for this account. Create
          the first entry to get started.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreateEntry}
        className={adminPrimaryButtonClass}
      >
        <Plus size={15} strokeWidth={2.5} />
        Create First Entry
      </button>
    </div>
  );
}
