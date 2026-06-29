"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BankAccountForDropdown } from "@repo/types";
import {
  AccountingFilterShell,
  accountingLabelClass,
  accountingSelectTriggerClass,
} from "../shared/accounting-styles";

export type FilterState = {
  bankId: string;
  bankName: string;
  accountId: string;
  accountName: string;
};

interface LedgerFiltersProps {
  accounts: BankAccountForDropdown[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  hideAccountSelector?: boolean;
}

export function LedgerFilters({
  accounts,
  filters,
  onChange,
  hideAccountSelector = false,
}: LedgerFiltersProps) {
  const banks = Array.from(
    new Map(
      accounts.map((a) => [a.bankId, { id: a.bankId, name: a.bankName }]),
    ).values(),
  );

  const filteredAccounts =
    filters.bankId === "all"
      ? accounts
      : accounts.filter((a) => a.bankId === filters.bankId);

  function handleBankChange(value: string | null) {
    const selectedBank = banks.find((b) => b.id === value);
    const currentAccountStillValid = accounts.find(
      (a) => a.id === filters.accountId && a.bankId === value,
    );
    onChange({
      bankId: value ?? "all",
      bankName: selectedBank?.name ?? "all",
      accountId: currentAccountStillValid ? filters.accountId : "all",
      accountName: currentAccountStillValid ? filters.accountName : "all",
    });
  }

  function handleAccountChange(value: string | null) {
    const selectedAccount = accounts.find((a) => a.id === value);
    onChange({
      ...filters,
      accountId: value ?? "all",
      accountName: selectedAccount?.accountName ?? "all",
      bankId: selectedAccount?.bankId ?? filters.bankId,
      bankName: selectedAccount?.bankName ?? filters.bankName,
    });
  }

  const hasActiveFilters =
    filters.bankId !== "all" || filters.accountId !== "all";

  function handleClear() {
    onChange({
      bankId: "all",
      bankName: "all",
      accountId: "all",
      accountName: "all",
    });
  }

  return (
    <AccountingFilterShell
      hasActiveFilters={hasActiveFilters}
      onClear={handleClear}
    >
      <div className="flex flex-wrap gap-4">
        <div className="flex min-w-[160px] flex-1 flex-col gap-2">
          <span className={accountingLabelClass}>Bank</span>
          <Select value={filters.bankId} onValueChange={handleBankChange}>
            <SelectTrigger className={accountingSelectTriggerClass}>
              <SelectValue placeholder="All Banks">
                {filters.bankId === "all"
                  ? "All Banks"
                  : (banks.find((b) => b.id === filters.bankId)?.name ??
                    "All Banks")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Banks</SelectItem>
              {banks.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!hideAccountSelector && (
          <div className="flex min-w-[160px] flex-1 flex-col gap-2">
            <span className={accountingLabelClass}>Bank Account</span>
            <Select
              value={filters.accountId}
              onValueChange={handleAccountChange}
            >
              <SelectTrigger className={accountingSelectTriggerClass}>
                <SelectValue placeholder="All Accounts">
                  {filters.accountId === "all"
                    ? "All Accounts"
                    : (filteredAccounts.find((a) => a.id === filters.accountId)
                        ?.accountName ?? "All Accounts")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {filteredAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.accountName}
                    <span className="text-[rgba(47,78,64,0.45)]">
                      {" "}
                      — {a.bankName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </AccountingFilterShell>
  );
}
