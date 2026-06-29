"use client";

import { cn } from "@/lib/utils";
import { adminSecondaryButtonClass } from "@/components/admin/admin-styles";

type PaginationProps = {
  page: number;
  meta: {
    total: number;
    totalPages: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
};

const pageBtnClass = cn(
  adminSecondaryButtonClass,
  "h-8 min-w-8 justify-center px-2.5 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-40",
);

export function Pagination({ page, meta, onPageChange }: PaginationProps) {
  const { total, totalPages, limit } = meta;

  if (totalPages <= 1 || total <= limit) {
    return null;
  }

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[rgba(47,78,64,0.12)] px-5 py-4 sm:flex-row">
      <span className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
        {total === 0 ? "No records" : `Showing ${from}–${to} of ${total}`}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className={pageBtnClass}
          aria-label="First page"
        >
          «
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={pageBtnClass}
        >
          Prev
        </button>
        <span className="px-2 font-[family-name:var(--font-dm-sans)] text-xs font-semibold tabular-nums text-(--brand-green)">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={pageBtnClass}
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className={pageBtnClass}
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}
