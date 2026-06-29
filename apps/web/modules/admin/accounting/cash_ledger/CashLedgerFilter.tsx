"use client";

import { CalendarDays } from "lucide-react";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BSToAD } from "bikram-sambat-js";
import {
  AccountingFilterShell,
  accountingFieldInputClass,
  accountingLabelClass,
} from "../shared/accounting-styles";

export type CashLedgerFilters = {
  fromBsDate: string | null;
  fromDate: string | null;
  toBsDate: string | null;
  toDate: string | null;
};

interface CashLedgerFiltersProps {
  filters: CashLedgerFilters;
  onChange: (filters: CashLedgerFilters) => void;
}

export function CashLedgerFilters({
  filters,
  onChange,
}: CashLedgerFiltersProps) {
  const hasFilters = !!(filters.fromBsDate || filters.toBsDate);

  function handleFromDateChange(bsValue: string) {
    try {
      const adValue = BSToAD(bsValue);
      onChange({
        ...filters,
        fromBsDate: bsValue,
        fromDate: adValue,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid from date");
    }
  }

  function handleToDateChange(bsValue: string) {
    try {
      const adValue = BSToAD(bsValue);
      onChange({
        ...filters,
        toBsDate: bsValue,
        toDate: adValue,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid to date");
    }
  }

  function handleClear() {
    onChange({
      fromDate: null,
      toDate: null,
      fromBsDate: null,
      toBsDate: null,
    });
  }

  return (
    <AccountingFilterShell hasActiveFilters={hasFilters} onClear={handleClear}>
      <div className="flex flex-wrap gap-4">
        <div className="flex min-w-[160px] flex-1 flex-col gap-2">
          <span className={accountingLabelClass}>From Date (BS)</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.4)]">
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <NepaliDatePicker
              inputClassName={cn(accountingFieldInputClass, "pl-9")}
              value={filters.fromBsDate ?? ""}
              onChange={(bsValue: string) => {
                if (bsValue) handleFromDateChange(bsValue);
              }}
              options={{ calenderLocale: "en", valueLocale: "en" }}
            />
          </div>
        </div>

        <div className="flex min-w-[160px] flex-1 flex-col gap-2">
          <span className={accountingLabelClass}>To Date (BS)</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.4)]">
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <NepaliDatePicker
              inputClassName={cn(accountingFieldInputClass, "pl-9")}
              value={filters.toBsDate ?? ""}
              onChange={(bsValue: string) => {
                if (bsValue) handleToDateChange(bsValue);
              }}
              options={{ calenderLocale: "en", valueLocale: "en" }}
            />
          </div>
        </div>
      </div>
    </AccountingFilterShell>
  );
}
