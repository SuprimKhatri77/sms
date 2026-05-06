"use client";

import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  meta: {
    total: number;
    totalPages: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
};

export function Pagination({ page, meta, onPageChange }: PaginationProps) {
  const { total, totalPages, limit } = meta;

  // 🚫 Hide pagination when not needed
  if (totalPages <= 1 || total <= limit) {
    return null;
  }

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-sm text-[var(--brand-ink)]/60"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      <span>
        {total === 0
          ? "No records"
          : `Showing ${from}–${to} of ${total} records`}
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="border-[var(--brand-ink)]/20 h-8 px-2"
          aria-label="First page"
        >
          «
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="border-[var(--brand-ink)]/20 h-8 px-3"
        >
          Prev
        </Button>

        <span className="px-3 py-1 text-[var(--brand-ink)] font-medium">
          {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="border-[var(--brand-ink)]/20 h-8 px-3"
        >
          Next
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="border-[var(--brand-ink)]/20 h-8 px-2"
          aria-label="Last page"
        >
          »
        </Button>
      </div>
    </div>
  );
}
