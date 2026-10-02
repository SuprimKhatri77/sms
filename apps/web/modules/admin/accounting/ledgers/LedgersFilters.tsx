"use client";

import { useCallback, useMemo, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { toast } from "sonner";
import { BSToAD } from "bikram-sambat-js";
import {
  LEDGER_TYPES,
  ledgerTypeValues,
  type AccountGroup,
  type BankAccountForDropdown,
  type LedgerType,
} from "@repo/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { searchBankAccountsForDropdown } from "@/lib/api/bank_accounts";
import type { LedgerFilterParams } from "@/lib/api/ledgers";
import {
  buildTreeOptions,
  getPathLabel,
} from "@/components/admin/hierarchy/tree";
import { useAdminClearFiltersShortcut } from "@/components/admin/admin-shortcut-provider";
import {
  AccountingFilterShell,
  accountingFieldInputClass,
  accountingLabelClass,
  accountingSelectTriggerClass,
} from "../shared/accounting-styles";
import { withAllOption } from "../shared/withAllOption";
import { SearchableSelect } from "../../inventory/shared/SearchableSelect";
import {
  useBankSearch,
  useSupplierSearch,
} from "../../inventory/shared/useProductSupplierSearch";

/** The filters plus what the pickers show for the picked ids. */
export type LedgerFilterState = LedgerFilterParams & {
  supplierName: string;
  bankName: string;
  accountName: string;
  fromBsDate: string;
  toBsDate: string;
};

export const EMPTY_LEDGER_FILTERS: LedgerFilterState = {
  ledgerType: "",
  supplierID: "",
  supplierName: "",
  bankID: "",
  bankName: "",
  accountID: "",
  accountName: "",
  accountGroupID: "",
  fromDate: "",
  fromBsDate: "",
  toDate: "",
  toBsDate: "",
};

const ALL = "all";
const ALL_LEDGERS_LABEL = "All ledgers";

interface LedgersFiltersProps {
  filters: LedgerFilterState;
  onChange: (filters: LedgerFilterState) => void;
  accountGroups: AccountGroup[];
}

export function LedgersFilters({
  filters,
  onChange,
  accountGroups,
}: LedgersFiltersProps) {
  const spec = filters.ledgerType ? LEDGER_TYPES[filters.ledgerType] : null;

  const supplierSearch = useSupplierSearch();
  const searchSuppliers = useMemo(
    () => withAllOption(supplierSearch, "All suppliers"),
    [supplierSearch],
  );
  const bankSearch = useBankSearch();
  const searchBanks = useMemo(
    () => withAllOption(bankSearch, "All banks"),
    [bankSearch],
  );

  // accounts seen in search results, so picking one can also fill in its bank
  const accountLookupRef = useRef(new Map<string, BankAccountForDropdown>());
  const searchAccounts = useCallback(
    async (q: string) => {
      const rows = await searchBankAccountsForDropdown({
        name: q,
        bankID: filters.bankID,
        limit: 10,
      });
      for (const a of rows) accountLookupRef.current.set(a.id, a);
      const options = rows.map((a) => ({
        value: a.id,
        label: `${a.accountName} — ${a.bankName}`,
      }));
      return q ? options : [{ value: ALL, label: "All accounts" }, ...options];
    },
    [filters.bankID],
  );

  const groupsById = useMemo(
    () => new Map(accountGroups.map((g) => [g.id, g])),
    [accountGroups],
  );
  const searchGroups = useCallback(
    async (q: string) => {
      const options = buildTreeOptions(accountGroups, q);
      return q ? options : [{ value: ALL, label: "All groups" }, ...options];
    },
    [accountGroups],
  );

  // a different ledger has different parties, so its own filters start over
  function handleTypeChange(value: string | null) {
    if (!value) return;
    onChange({
      ...EMPTY_LEDGER_FILTERS,
      ledgerType: value === ALL ? "" : (value as LedgerType),
      fromDate: filters.fromDate,
      fromBsDate: filters.fromBsDate,
      toDate: filters.toDate,
      toBsDate: filters.toBsDate,
    });
  }

  function handleBankChange(value: string, label: string) {
    const bankID = value === ALL ? "" : value;
    const accountStillValid =
      accountLookupRef.current.get(filters.accountID)?.bankId === bankID;
    onChange({
      ...filters,
      bankID,
      bankName: bankID ? label : "",
      accountID: accountStillValid ? filters.accountID : "",
      accountName: accountStillValid ? filters.accountName : "",
    });
  }

  function handleAccountChange(value: string, label: string) {
    if (value === ALL) {
      onChange({ ...filters, accountID: "", accountName: "" });
      return;
    }
    const account = accountLookupRef.current.get(value);
    onChange({
      ...filters,
      accountID: value,
      accountName: label,
      bankID: account?.bankId ?? filters.bankID,
      bankName: account?.bankName ?? filters.bankName,
    });
  }

  function handleDate(which: "from" | "to", bsValue: string) {
    try {
      const ad = BSToAD(bsValue);
      onChange(
        which === "from"
          ? { ...filters, fromBsDate: bsValue, fromDate: ad }
          : { ...filters, toBsDate: bsValue, toDate: ad },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid date");
    }
  }

  const hasActiveFilters = Object.entries(filters).some(([, v]) => !!v);
  const handleClear = useCallback(
    () => onChange(EMPTY_LEDGER_FILTERS),
    [onChange],
  );
  useAdminClearFiltersShortcut(handleClear);

  return (
    <AccountingFilterShell
      hasActiveFilters={hasActiveFilters}
      onClear={handleClear}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex min-w-0 flex-col gap-2">
          <span className={accountingLabelClass}>Ledger</span>
          <Select
            value={filters.ledgerType || ALL}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger
              className={accountingSelectTriggerClass}
              aria-label="Ledger"
            >
              <SelectValue>
                {filters.ledgerType
                  ? LEDGER_TYPES[filters.ledgerType].label
                  : ALL_LEDGERS_LABEL}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{ALL_LEDGERS_LABEL}</SelectItem>
              {ledgerTypeValues.map((t) => (
                <SelectItem key={t} value={t}>
                  {LEDGER_TYPES[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {spec?.party === "supplier" && (
          <div className="flex min-w-0 flex-col gap-2">
            <span className={accountingLabelClass}>Supplier</span>
            <SearchableSelect
              value={filters.supplierID || ALL}
              onChange={(value, label) =>
                onChange({
                  ...filters,
                  supplierID: value === ALL ? "" : value,
                  supplierName: value === ALL ? "" : label,
                })
              }
              onSearch={searchSuppliers}
              placeholder="Search supplier…"
              selectedLabel={filters.supplierName || "All suppliers"}
            />
          </div>
        )}

        {spec?.accountGroup && (
          <div className="flex min-w-0 flex-col gap-2">
            <span className={accountingLabelClass}>Account group</span>
            <SearchableSelect
              value={filters.accountGroupID || ALL}
              onChange={(value) =>
                onChange({
                  ...filters,
                  accountGroupID: value === ALL ? "" : value,
                })
              }
              onSearch={searchGroups}
              placeholder="Search groups…"
              selectedLabel={
                filters.accountGroupID
                  ? getPathLabel(groupsById, filters.accountGroupID) ||
                    "Unknown group"
                  : "All groups"
              }
              debounceMs={0}
            />
          </div>
        )}

        {spec?.party === "bankAccount" && (
          <>
            <div className="flex min-w-0 flex-col gap-2">
              <span className={accountingLabelClass}>Bank</span>
              <SearchableSelect
                value={filters.bankID || ALL}
                onChange={handleBankChange}
                onSearch={searchBanks}
                placeholder="Search bank…"
                selectedLabel={filters.bankName || "All banks"}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <span className={accountingLabelClass}>Account</span>
              <SearchableSelect
                // re-mount when the bank changes so the options re-load
                key={filters.bankID || ALL}
                value={filters.accountID || ALL}
                onChange={handleAccountChange}
                onSearch={searchAccounts}
                placeholder="Search account…"
                selectedLabel={filters.accountName || "All accounts"}
              />
            </div>
          </>
        )}

        <div className="flex min-w-0 flex-col gap-2">
          <span className={accountingLabelClass}>From date (BS)</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.4)]">
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <NepaliDatePicker
              inputClassName={cn(accountingFieldInputClass, "pl-9")}
              value={filters.fromBsDate}
              onChange={(v: string) => {
                if (v) handleDate("from", v);
              }}
              options={{ calenderLocale: "en", valueLocale: "en" }}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <span className={accountingLabelClass}>To date (BS)</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.4)]">
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <NepaliDatePicker
              inputClassName={cn(accountingFieldInputClass, "pl-9")}
              value={filters.toBsDate}
              onChange={(v: string) => {
                if (v) handleDate("to", v);
              }}
              options={{ calenderLocale: "en", valueLocale: "en" }}
            />
          </div>
        </div>
      </div>
    </AccountingFilterShell>
  );
}
