"use client";

import type { RefObject } from "react";
import { ChevronsDownUp, ChevronsUpDown, Search } from "lucide-react";
import {
  adminInputClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import {
  AccountingFilterShell,
  accountingLabelClass,
} from "@/modules/admin/accounting/shared/accounting-styles";

type HierarchyToolbarProps = {
  id: string;
  search: string;
  onSearchChange: (value: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  placeholder: string;
  /** Defaults to the fields searched in hierarchies that have codes. */
  label?: string;
  onExpandAll: () => void;
  onCollapseAll: () => void;
};

export function HierarchyToolbar({
  id,
  search,
  onSearchChange,
  searchRef,
  placeholder,
  label = "Name, code or description",
  onExpandAll,
  onCollapseAll,
}: HierarchyToolbarProps) {
  const searching = search.trim() !== "";
  return (
    <AccountingFilterShell
      title="Search"
      hasActiveFilters={search !== ""}
      onClear={() => onSearchChange("")}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5 md:w-96">
          <label className={accountingLabelClass} htmlFor={id}>
            {label}
          </label>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]" />
            <input
              ref={searchRef}
              id={id}
              placeholder={placeholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                adminInputClass,
                "rounded-none pl-9 normal-case tracking-normal",
              )}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onExpandAll}
            disabled={searching}
            className={cn(
              adminSecondaryButtonClass,
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <ChevronsUpDown size={13} />
            Expand all
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            disabled={searching}
            className={cn(
              adminSecondaryButtonClass,
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <ChevronsDownUp size={13} />
            Collapse all
          </button>
        </div>
      </div>
    </AccountingFilterShell>
  );
}
