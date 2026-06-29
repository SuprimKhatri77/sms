"use client";

import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type StudentUrlPaginationProps = {
  page: number;
  totalPages: number;
  isDisabled?: boolean;
};

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

export function StudentUrlPagination({
  page,
  totalPages,
  isDisabled,
}: StudentUrlPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(p));
      router.push(`${pathname}?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, pathname, searchParams],
  );

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);
  const btnBase =
    "inline-flex h-9 w-9 items-center justify-center border border-[rgba(47,78,64,0.18)] font-[family-name:var(--font-dm-sans)] text-xs font-semibold transition-colors select-none";
  const btnActive = "bg-(--brand-green) text-white";
  const btnInactive =
    "bg-white text-(--brand-green) hover:bg-[rgba(47,78,64,0.04)]";
  const btnDisabled =
    "cursor-not-allowed border-[rgba(47,78,64,0.1)] text-[rgba(47,78,64,0.25)]";

  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-4"
      role="navigation"
      aria-label="Pagination"
    >
      <p className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-0">
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1 || isDisabled}
          aria-label="Previous page"
          className={cn(
            btnBase,
            "border-r-0",
            page <= 1 || isDisabled ? btnDisabled : btnInactive,
          )}
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className={cn(
                btnBase,
                "w-9 border-r-0 text-[rgba(47,78,64,0.4)]",
              )}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p as number)}
              disabled={isDisabled}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                btnBase,
                "border-r-0",
                p === page ? btnActive : btnInactive,
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages || isDisabled}
          aria-label="Next page"
          className={cn(
            btnBase,
            page >= totalPages || isDisabled ? btnDisabled : btnInactive,
          )}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
