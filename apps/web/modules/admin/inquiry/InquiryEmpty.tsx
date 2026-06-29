"use client";

import { Inbox, RefreshCw, Filter } from "lucide-react";

import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";

interface Props {
  message?: string;
  code?: string;
  activeFilter?: string;
  onClearFilter?: () => void;
  onRetry?: () => void;
}

export default function InquiryEmpty({
  message,
  code,
  activeFilter,
  onClearFilter,
  onRetry,
}: Props) {
  const isFiltered = !!activeFilter && activeFilter !== "all";

  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center px-4 py-16">
      <div className="mb-6 flex h-14 w-14 items-center justify-center border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.04)]">
        <Inbox className="h-7 w-7 text-(--brand-green)" strokeWidth={1.5} />
      </div>

      {code && (
        <span className="mb-4 inline-flex items-center gap-1.5 border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.04)] px-3 py-1 font-mono text-[10px] font-semibold tracking-widest text-(--brand-green) uppercase">
          {code}
        </span>
      )}

      <h2 className="text-center font-[family-name:var(--font-lora)] text-xl font-bold text-(--brand-green)">
        {isFiltered ? `No "${activeFilter}" inquiries` : "No inquiries yet"}
      </h2>

      <p className="mt-2 max-w-md text-center font-[family-name:var(--font-dm-sans)] text-sm leading-relaxed text-[rgba(47,78,64,0.55)]">
        {message ??
          (isFiltered
            ? `There are no inquiries matching the "${activeFilter}" filter. Try a different filter or check back later.`
            : "When visitors submit inquiries through your contact forms, they'll appear here.")}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {isFiltered && onClearFilter && (
          <button onClick={onClearFilter} className={adminPrimaryButtonClass}>
            <Filter className="h-4 w-4" />
            Clear Filter
          </button>
        )}

        {onRetry && (
          <button onClick={onRetry} className={adminSecondaryButtonClass}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
