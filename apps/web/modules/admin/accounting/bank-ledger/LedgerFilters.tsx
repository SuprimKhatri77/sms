"use client";

import { useCallback, useMemo, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BSToAD } from "bikram-sambat-js";
import { BankAccountForDropdown } from "@repo/types";
import { searchBankAccountsForDropdown } from "@/lib/api/bank_ledger";
import {
  AccountingFilterShell,
  accountingFieldInputClass,
  accountingLabelClass,
} from "../shared/accounting-styles";
import { withAllOption } from "../shared/withAllOption";
import { SearchableSelect } from "../../inventory/shared/SearchableSelect";
import { useBankSearch } from "../../inventory/shared/useProductSupplierSearch";
import { useAdminClearFiltersShortcut } from "@/components/admin/admin-shortcut-provider";

export type FilterState = {
  bankId: string;
  bankName: string;
  accountId: string;
  accountName: string;
  fromBsDate: string | null;
  fromDate: string | null;
  toBsDate: string | null;
  toDate: string | null;
};

interface LedgerFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  hideAccountSelector?: boolean;
}

export function LedgerFilters({
  filters,
  onChange,
  hideAccountSelector = false,
}: LedgerFiltersProps) {
  const bankSearch = useBankSearch();
  const searchBanks = useMemo(
    () => withAllOption(bankSearch, "All Banks"),
    [bankSearch],
  );

  // Accounts seen in search results, so picking one can also fill in its bank
  const accountLookupRef = useRef(new Map<string, BankAccountForDropdown>());

  const searchAccounts = useCallback(
    async (q: string) => {
      const rows = await searchBankAccountsForDropdown({
        name: q,
        bankID: filters.bankId,
        limit: 10,
      });
      for (const a of rows) accountLookupRef.current.set(a.id, a);
      const options = rows.map((a) => ({
        value: a.id,
        label: `${a.accountName} — ${a.bankName}`,
      }));
      return q
        ? options
        : [{ value: "all", label: "All Accounts" }, ...options];
    },
    [filters.bankId],
  );

  function handleBankChange(value: string, label: string) {
    const currentAccountStillValid =
      accountLookupRef.current.get(filters.accountId)?.bankId === value;
    onChange({
      ...filters,
      bankId: value,
      bankName: value === "all" ? "all" : label,
      accountId: currentAccountStillValid ? filters.accountId : "all",
      accountName: currentAccountStillValid ? filters.accountName : "all",
    });
  }

  function handleAccountChange(value: string) {
    const selectedAccount = accountLookupRef.current.get(value);
    onChange({
      ...filters,
      accountId: value,
      accountName: selectedAccount?.accountName ?? "all",
      bankId: selectedAccount?.bankId ?? filters.bankId,
      bankName: selectedAccount?.bankName ?? filters.bankName,
    });
  }

  function handleFromDate(bsValue: string) {
    try {
      onChange({
        ...filters,
        fromBsDate: bsValue,
        fromDate: BSToAD(bsValue),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid from date");
    }
  }

  function handleToDate(bsValue: string) {
    try {
      onChange({
        ...filters,
        toBsDate: bsValue,
        toDate: BSToAD(bsValue),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid to date");
    }
  }

  const hasActiveFilters =
    filters.bankId !== "all" ||
    filters.accountId !== "all" ||
    !!filters.fromBsDate ||
    !!filters.toBsDate;

  const handleClear = useCallback(() => {
    onChange({
      bankId: "all",
      bankName: "all",
      accountId: "all",
      accountName: "all",
      fromDate: null,
      toDate: null,
      fromBsDate: null,
      toBsDate: null,
    });
  }, [onChange]);

  useAdminClearFiltersShortcut(handleClear);

  return (
    <AccountingFilterShell
      hasActiveFilters={hasActiveFilters}
      onClear={handleClear}
    >
      <div className="flex flex-wrap gap-4">
        <div className="flex min-w-[160px] flex-1 flex-col gap-2">
          <span className={accountingLabelClass}>Bank</span>
          <SearchableSelect
            value={filters.bankId}
            onChange={handleBankChange}
            onSearch={searchBanks}
            placeholder="Search bank…"
            selectedLabel={
              filters.bankId === "all" ? "All Banks" : filters.bankName
            }
          />
        </div>

        {!hideAccountSelector && (
          <div className="flex min-w-[160px] flex-1 flex-col gap-2">
            <span className={accountingLabelClass}>Bank Account</span>
            {/* Remount on bank change so the cached options reload for that bank */}
            <SearchableSelect
              key={filters.bankId}
              value={filters.accountId}
              onChange={handleAccountChange}
              onSearch={searchAccounts}
              placeholder="Search account…"
              selectedLabel={
                filters.accountId === "all"
                  ? "All Accounts"
                  : filters.accountName
              }
            />
          </div>
        )}

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
                if (bsValue) handleFromDate(bsValue);
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
                if (bsValue) handleToDate(bsValue);
              }}
              options={{ calenderLocale: "en", valueLocale: "en" }}
            />
          </div>
        </div>
      </div>
    </AccountingFilterShell>
  );
}
