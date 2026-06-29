"use client";

import { AlertCircle } from "lucide-react";

interface SuppliersErrorProps {
  message: string;
  onRetry: () => void;
}

export function SuppliersError({ message, onRetry }: SuppliersErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center border border-red-200 bg-red-50 text-red-500">
        <AlertCircle size={20} strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-[family-name:var(--font-lora)] text-base font-semibold text-[#1a1a1a]">
          Failed to load suppliers
        </p>
        <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="border border-[rgba(47,78,64,0.2)] px-4 py-2 font-[family-name:var(--font-dm-sans)] text-sm font-medium text-(--brand-green) transition-colors hover:bg-[rgba(47,78,64,0.04)]"
      >
        Try again
      </button>
    </div>
  );
}
