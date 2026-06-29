"use client";

import { CheckCircle2 } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="mb-1 grid h-20 w-20 place-items-center bg-[rgba(47,78,64,0.06)] text-(--brand-green)">
        <CheckCircle2 size={40} strokeWidth={1.25} />
      </div>
      <h3 className="font-[family-name:var(--font-lora)] text-xl font-bold text-(--brand-ink)">
        All clear!
      </h3>
      <p className="max-w-sm font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
        No students with outstanding fees match your current filters.
      </p>
    </div>
  );
}
