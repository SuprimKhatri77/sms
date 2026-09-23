"use client";

import { useCallback, useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BSToAD } from "bikram-sambat-js";
import { SupplierLedgerFilters } from "./types";
import {
  AccountingFilterShell,
  accountingFieldInputClass,
  accountingLabelClass,
} from "../shared/accounting-styles";
import { withAllOption } from "../shared/withAllOption";
import { SearchableSelect } from "../../inventory/shared/SearchableSelect";
import { useSupplierSearch } from "../../inventory/shared/useProductSupplierSearch";
import { useAdminClearFiltersShortcut } from "@/components/admin/admin-shortcut-provider";

interface SupplierLedgerFiltersBarProps {
  filters: SupplierLedgerFilters;
  onChange: (filters: SupplierLedgerFilters) => void;
}

export function SupplierLedgerFiltersBar({
  filters,
  onChange,
}: SupplierLedgerFiltersBarProps) {
  const hasFilters =
    filters.supplierId !== "all" || !!filters.fromBsDate || !!filters.toBsDate;

  const supplierSearch = useSupplierSearch();
  const searchSuppliers = useMemo(
    () => withAllOption(supplierSearch, "All Suppliers"),
    [supplierSearch],
  );

  function handleSupplierChange(value: string, label: string) {
    onChange({
      ...filters,
      supplierId: value,
      supplierName: value === "all" ? "all" : label,
    });
  }

  function handleFromDate(bsValue: string) {
    try {
      onChange({ ...filters, fromBsDate: bsValue, fromDate: BSToAD(bsValue) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid from date");
    }
  }

  function handleToDate(bsValue: string) {
    try {
      onChange({ ...filters, toBsDate: bsValue, toDate: BSToAD(bsValue) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid to date");
    }
  }

  const handleClear = useCallback(() => {
    onChange({
      supplierId: "all",
      supplierName: "all",
      fromDate: null,
      toDate: null,
      fromBsDate: null,
      toBsDate: null,
    });
  }, [onChange]);

  useAdminClearFiltersShortcut(handleClear);

  return (
    <AccountingFilterShell hasActiveFilters={hasFilters} onClear={handleClear}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className={accountingLabelClass}>Supplier</span>
          <SearchableSelect
            value={filters.supplierId}
            onChange={handleSupplierChange}
            onSearch={searchSuppliers}
            placeholder="Search supplier…"
            selectedLabel={
              filters.supplierId === "all"
                ? "All Suppliers"
                : filters.supplierName
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className={accountingLabelClass}>From Date (BS)</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.4)]">
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <NepaliDatePicker
              inputClassName={cn(accountingFieldInputClass, "pl-9")}
              value={filters.fromBsDate ?? ""}
              onChange={(v: string) => {
                if (v) handleFromDate(v);
              }}
              options={{ calenderLocale: "en", valueLocale: "en" }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className={accountingLabelClass}>To Date (BS)</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.4)]">
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <NepaliDatePicker
              inputClassName={cn(accountingFieldInputClass, "pl-9")}
              value={filters.toBsDate ?? ""}
              onChange={(v: string) => {
                if (v) handleToDate(v);
              }}
              options={{ calenderLocale: "en", valueLocale: "en" }}
            />
          </div>
        </div>
      </div>
    </AccountingFilterShell>
  );
}
