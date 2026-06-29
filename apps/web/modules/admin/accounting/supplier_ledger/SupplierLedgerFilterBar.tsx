"use client";

import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BSToAD } from "bikram-sambat-js";
import { SupplierForDropdown, SupplierLedgerFilters } from "./types";
import {
  AccountingFilterShell,
  accountingFieldInputClass,
  accountingLabelClass,
  accountingSelectTriggerClass,
} from "../shared/accounting-styles";

interface SupplierLedgerFiltersBarProps {
  suppliers: SupplierForDropdown[];
  filters: SupplierLedgerFilters;
  onChange: (filters: SupplierLedgerFilters) => void;
}

export function SupplierLedgerFiltersBar({
  suppliers,
  filters,
  onChange,
}: SupplierLedgerFiltersBarProps) {
  const hasFilters =
    filters.supplierId !== "all" || !!filters.fromBsDate || !!filters.toBsDate;

  function handleSupplierChange(value: string) {
    const selected = suppliers.find((s) => s.id === value);
    onChange({
      ...filters,
      supplierId: value,
      supplierName: selected?.companyName ?? "all",
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

  function handleClear() {
    onChange({
      supplierId: "all",
      supplierName: "all",
      fromDate: null,
      toDate: null,
      fromBsDate: null,
      toBsDate: null,
    });
  }

  return (
    <AccountingFilterShell hasActiveFilters={hasFilters} onClear={handleClear}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className={accountingLabelClass}>Supplier</span>
          <Select
            value={filters.supplierId}
            onValueChange={(v) => v && handleSupplierChange(v)}
          >
            <SelectTrigger className={accountingSelectTriggerClass}>
              <SelectValue placeholder="All Suppliers">
                {filters.supplierId === "all"
                  ? "All Suppliers"
                  : (suppliers.find((s) => s.id === filters.supplierId)
                      ?.companyName ?? "All Suppliers")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
