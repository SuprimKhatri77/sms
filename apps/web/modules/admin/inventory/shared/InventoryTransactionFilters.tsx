"use client";

import { CalendarDays, Search } from "lucide-react";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { inputCls } from "../../students/detail/shared/utils";
import {
  adminInputClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-styles";
import { InventoryFilterShell } from "./InventoryFilterShell";
import { inventoryLabelClass } from "./inventory-styles";

type InventoryTransactionFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchLabel?: string;
  priceSort: "asc" | "desc" | "";
  onPriceSortChange: (value: "asc" | "desc" | "") => void;
  pendingFrom: string;
  pendingTo: string;
  onPendingFromChange: (value: string) => void;
  onPendingToChange: (value: string) => void;
  hasPendingDateChange: boolean;
  onApplyDates: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
};

export function InventoryTransactionFilters({
  search,
  onSearchChange,
  searchPlaceholder,
  searchLabel = "Search",
  priceSort,
  onPriceSortChange,
  pendingFrom,
  pendingTo,
  onPendingFromChange,
  onPendingToChange,
  hasPendingDateChange,
  onApplyDates,
  hasActiveFilters,
  onClear,
}: InventoryTransactionFiltersProps) {
  return (
    <InventoryFilterShell hasActiveFilters={hasActiveFilters} onClear={onClear}>
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-1.5 md:col-span-4">
          <label className={inventoryLabelClass} htmlFor="inventory-tx-search">
            {searchLabel}
          </label>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]" />
            <input
              id="inventory-tx-search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                const v = e.target.value;
                if (!v.startsWith(" ")) onSearchChange(v);
              }}
              className={cn(adminInputClass, "rounded-none pl-9 normal-case tracking-normal")}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5 md:col-span-2">
          <span className={inventoryLabelClass}>Sort by rate</span>
          <Select
            value={priceSort}
            onValueChange={(v) => onPriceSortChange(v as "asc" | "desc" | "")}
          >
            <SelectTrigger
              className={cn(
                adminInputClass,
                "h-auto w-full rounded-none py-2 normal-case tracking-normal shadow-none",
              )}
            >
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent className="border border-[rgba(47,78,64,0.18)] bg-white">
              <SelectItem value="">Default</SelectItem>
              <SelectItem value="asc">Low → High</SelectItem>
              <SelectItem value="desc">High → Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5 md:col-span-6">
          <span className={inventoryLabelClass}>Date range (BS)</span>
          <div className="flex w-full flex-wrap items-center gap-2">
            <div className="relative min-w-[9rem] flex-1">
              <CalendarDays
                className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]"
                strokeWidth={1.75}
              />
              <NepaliDatePicker
                inputClassName={cn(inputCls, "rounded-none pl-9")}
                value={pendingFrom}
                onChange={onPendingFromChange}
                options={{ calenderLocale: "en", valueLocale: "en" }}
              />
            </div>
            <span className="shrink-0 text-sm text-[rgba(47,78,64,0.45)]">to</span>
            <div className="relative min-w-[9rem] flex-1">
              <CalendarDays
                className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]"
                strokeWidth={1.75}
              />
              <NepaliDatePicker
                inputClassName={cn(inputCls, "rounded-none pl-9")}
                value={pendingTo}
                onChange={onPendingToChange}
                options={{ calenderLocale: "en", valueLocale: "en" }}
              />
            </div>
            {hasPendingDateChange ? (
              <button type="button" onClick={onApplyDates} className={adminPrimaryButtonClass}>
                Apply dates
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </InventoryFilterShell>
  );
}
