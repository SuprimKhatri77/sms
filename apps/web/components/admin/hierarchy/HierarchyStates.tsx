"use client";

import { AlertCircle } from "lucide-react";
import { accountingTableWrapClass } from "@/modules/admin/accounting/shared/accounting-styles";

export function HierarchySkeleton() {
  return (
    <div className={`${accountingTableWrapClass} animate-pulse`}>
      <div className="border-b border-[rgba(47,78,64,0.08)] px-5 py-3.5">
        <div className="flex gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-20 bg-[rgba(47,78,64,0.08)]" />
          ))}
        </div>
      </div>
      {[0, 1, 2, 1, 2, 0].map((depth, i) => (
        <div
          key={i}
          className="flex items-center gap-8 border-b border-[rgba(47,78,64,0.06)] px-5 py-4 last:border-0"
        >
          <div
            className="h-4 w-40 bg-[rgba(47,78,64,0.08)]"
            style={{ marginLeft: depth * 22 }}
          />
          <div className="h-4 w-16 bg-[rgba(47,78,64,0.06)]" />
          <div className="h-4 w-48 bg-[rgba(47,78,64,0.06)]" />
        </div>
      ))}
    </div>
  );
}

type HierarchyErrorProps = {
  title: string;
  message: string;
  onRetry: () => void;
};

export function HierarchyError({
  title,
  message,
  onRetry,
}: HierarchyErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center border border-red-200 bg-red-50 text-red-500">
        <AlertCircle size={20} strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-(family-name:--font-lora) text-base font-semibold text-[#1a1a1a]">
          {title}
        </p>
        <p className="mt-1 font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.55)]">
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="border border-[rgba(47,78,64,0.2)] px-4 py-2 font-(family-name:--font-dm-sans) text-sm font-medium text-(--brand-green) transition-colors hover:bg-[rgba(47,78,64,0.04)]"
      >
        Try again
      </button>
    </div>
  );
}
