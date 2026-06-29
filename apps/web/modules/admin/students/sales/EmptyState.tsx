"use client";

import { AlertCircle, Briefcase } from "lucide-react";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="mb-1 grid h-20 w-20 place-items-center bg-[rgba(47,78,64,0.06)] text-(--brand-green)">
        <Briefcase size={40} strokeWidth={1.25} />
      </div>
      <h3 className="font-[family-name:var(--font-lora)] text-xl font-bold text-(--brand-ink)">
        No revenue records
      </h3>
      <p className="max-w-sm font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
        No students match the current filter range. Try adjusting the dates.
      </p>
    </div>
  );
}

interface ErrorStateProps {
  onRetry?: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="mb-1 grid h-20 w-20 place-items-center bg-red-50 text-[#9a3412]">
        <AlertCircle size={36} strokeWidth={1.5} />
      </div>
      <h3 className="font-[family-name:var(--font-lora)] text-xl font-bold text-(--brand-ink)">
        Something went wrong
      </h3>
      <p className="max-w-sm font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
        We couldn&apos;t load the sales data. Please try again.
      </p>
      {onRetry ? (
        <button type="button" className={adminPrimaryButtonClass} onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
