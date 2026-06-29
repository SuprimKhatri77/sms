"use client";

import type { ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { adminSecondaryButtonClass } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import { inventoryFilterPanelClass, inventoryLabelClass } from "./inventory-styles";

type InventoryFilterShellProps = {
  children: ReactNode;
  hasActiveFilters?: boolean;
  onClear?: () => void;
  title?: string;
  className?: string;
};

export function InventoryFilterShell({
  children,
  hasActiveFilters,
  onClear,
  title = "Filters",
  className,
}: InventoryFilterShellProps) {
  return (
    <div className={cn(inventoryFilterPanelClass, className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span
          className={cn(
            inventoryLabelClass,
            "flex items-center gap-1.5 normal-case tracking-[0.1em]",
          )}
        >
          <SlidersHorizontal size={13} />
          {title}
        </span>
        {hasActiveFilters && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className={cn(adminSecondaryButtonClass, "h-8 px-3 py-1.5 text-[10px]")}
          >
            <X size={13} />
            Clear
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
