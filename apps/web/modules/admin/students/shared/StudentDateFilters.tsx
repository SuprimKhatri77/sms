"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BsDatePicker } from "@/components/bs-date-picker";
import { bsToAdString } from "@/lib/bs-date";
import { toast } from "sonner";

import { adminInputClass, adminSecondaryButtonClass } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/modules/admin/analytics/hooks/useDebounce";
import { PARAM_FROM_BS, PARAM_TO_BS } from "./student-date-filter-utils";
import {
  useAdminClearFiltersShortcut,
  useAdminFocusSearchShortcut,
} from "@/components/admin/admin-shortcut-provider";

type StudentDateFiltersProps = {
  isPending?: boolean;
  showSearch?: boolean;
};

const labelClass =
  "font-(family-name:--font-dm-sans) text-[10px] font-semibold uppercase tracking-widest text-[rgba(47,78,64,0.55)]";

export function StudentDateFilters({
  isPending,
  showSearch = false,
}: StudentDateFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromBs = searchParams.get(PARAM_FROM_BS) ?? "";
  const toBs = searchParams.get(PARAM_TO_BS) ?? "";
  const search = searchParams.get("search") ?? "";
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (!showSearch) return;
    const trimmed = debouncedSearch.trim();
    const current = searchParams.get("search") ?? "";
    if (trimmed === current) return;
    updateParams({ search: trimmed || null });
  }, [debouncedSearch, showSearch, searchParams, updateParams]);

  const handleFromBs = (bsValue: string) => {
    if (!bsValue) {
      updateParams({ [PARAM_FROM_BS]: null });
      return;
    }
    try {
      bsToAdString(bsValue);
      updateParams({ [PARAM_FROM_BS]: bsValue });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid from date");
    }
  };

  const handleToBs = (bsValue: string) => {
    if (!bsValue) {
      updateParams({ [PARAM_TO_BS]: null });
      return;
    }
    try {
      bsToAdString(bsValue);
      updateParams({ [PARAM_TO_BS]: bsValue });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid to date");
    }
  };

  const clearAll = useCallback(() => {
    setSearchInput("");
    router.push(pathname);
  }, [router, pathname]);

  const focusSearch = useCallback(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  useAdminClearFiltersShortcut(clearAll);
  useAdminFocusSearchShortcut(focusSearch);

  const hasFilters =
    fromBs || toBs || (showSearch && (search || searchInput.trim()));

  const datePickerClass = cn(
    adminInputClass,
    "normal-case tracking-normal",
  );

  const dateFieldClass = cn(
    "flex flex-col gap-1.5",
    showSearch ? "min-w-[220px] flex-1" : "w-full",
  );

  return (
    <div className="mb-6 overflow-visible border border-[rgba(47,78,64,0.18)] bg-white p-4 sm:p-5">
      <div
        className={cn(
          "gap-4",
          showSearch
            ? "flex flex-wrap items-end"
            : "grid grid-cols-1 items-end sm:grid-cols-2",
        )}
      >
        {showSearch ? (
          <div className="flex w-full shrink-0 flex-col gap-1.5 sm:w-[220px]">
            <label className={labelClass} htmlFor="student-finance-search">
              Search Student
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]"
                strokeWidth={1.75}
              />
              <input
                ref={searchInputRef}
                id="student-finance-search"
                type="text"
                className={cn(adminInputClass, "pl-9 normal-case tracking-normal")}
                placeholder="Name or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        ) : null}

        <div className={dateFieldClass}>
          <label className={labelClass} htmlFor="student-finance-from-bs">
            From (BS)
          </label>
          <div className="w-full overflow-visible">
            <BsDatePicker
              fieldClassName={datePickerClass}
              clearable
              value={fromBs}
              onChange={(v: string) => handleFromBs(v)}
            />
          </div>
        </div>

        <div className={dateFieldClass}>
          <label className={labelClass} htmlFor="student-finance-to-bs">
            To (BS)
          </label>
          <div className="w-full overflow-visible">
            <BsDatePicker
              fieldClassName={datePickerClass}
              clearable
              value={toBs}
              onChange={(v: string) => handleToBs(v)}
            />
          </div>
        </div>

        {hasFilters ? (
          <button
            type="button"
            className={cn(
              adminSecondaryButtonClass,
              showSearch ? "self-end shrink-0" : "justify-self-start sm:col-span-2",
            )}
            onClick={clearAll}
            disabled={isPending}
          >
            <X size={14} />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
