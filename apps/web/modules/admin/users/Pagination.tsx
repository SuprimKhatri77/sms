"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", total);
  } else if (current >= total - 3) {
    pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages);

  const btnBase =
    "inline-flex items-center justify-center w-9 h-9 font-mono text-xs font-semibold border border-black transition-colors select-none";
  const btnActive = "bg-black text-white";
  const btnInactive = "bg-white text-black hover:bg-black hover:text-white";
  const btnDisabled =
    "border-zinc-300 text-zinc-300 cursor-not-allowed pointer-events-none";

  return (
    <div
      className="flex items-center gap-0"
      role="navigation"
      aria-label="Pagination"
    >
      {/* Prev arrow */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive} border-r-0`}
      >
        <ChevronLeft size={14} />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className={`${btnBase} border-r-0 cursor-default pointer-events-none text-zinc-400`}
          >
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
            className={`${btnBase} border-r-0 ${
              p === currentPage ? btnActive : btnInactive
            }`}
          >
            {p}
          </button>
        ),
      )}

      {/* Next arrow */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={`${btnBase} ${
          currentPage === totalPages ? btnDisabled : btnInactive
        }`}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
