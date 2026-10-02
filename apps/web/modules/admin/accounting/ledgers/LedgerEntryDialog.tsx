"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { BSToAD } from "bikram-sambat-js";
import { AxiosError } from "axios";
import z from "zod";
import {
  LEDGER_TYPES,
  ledgerEntryInputSchema,
  ledgerTypeValues,
  type APIError,
  type AccountGroup,
  type LedgerEntry,
  type LedgerEntryInput,
  type LedgerPaymentType,
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
import { mapFieldErrors } from "@/utils/api";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import {
  buildTreeOptions,
  getPathLabel,
  ROOT_OPTION_VALUE,
} from "@/components/admin/hierarchy/tree";
import { useBankAccountsDropdown } from "@/hooks/queries/admin/banks/bank_accounts/useBankAccountsDropdown";
import {
  AccountingFormField,
  AccountingFormSection,
  accountingFieldInputClass,
  accountingSelectTriggerClass,
} from "../shared/accounting-styles";
import { SearchableSelect } from "../../inventory/shared/SearchableSelect";
import {
  useBankAccountSearch,
  useSupplierSearch,
} from "../../inventory/shared/useProductSupplierSearch";

// a supplier payment is booked in the cash ledger or against a bank account
const PAYMENT_OPTIONS: {
  value: LedgerPaymentType;
  label: string;
  hint: string;
}[] = [
  { value: "cash", label: "Cash", hint: "Recorded as cash out" },
  { value: "bank", label: "Bank", hint: "Recorded against a bank account" },
];

const ENTRY_TYPE_LABELS: Record<LedgerType, { cr: string; dr: string }> = {
  cash: { cr: "Credit — Cash in", dr: "Debit — Cash out" },
  bank: { cr: "Credit — Money in", dr: "Debit — Money out" },
  supplier: {
    cr: "Credit — Purchase / payable added",
    dr: "Debit — Payment made to supplier",
  },
};

const NO_GROUP_LABEL = "No account group";

type FieldErrors = Partial<Record<keyof LedgerEntryInput, string>>;

interface LedgerEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** the entry being edited; null to add one */
  entry: LedgerEntry | null;
  /** the ledger a new entry starts in (the list's ledger filter) */
  defaultLedgerType: LedgerType | "";
  accountGroups: AccountGroup[];
  loading: boolean;
  onSubmit: (data: LedgerEntryInput) => Promise<void>;
}

/**
 * Add or edit an entry in any ledger. The fields follow the ledger type:
 * a bank entry needs its account, a supplier entry its supplier, and a
 * supplier payment how it was paid (which also books the cash/bank side).
 * Mount it with a fresh `key` per entry so the fields start from it.
 */
export function LedgerEntryDialog({
  open,
  onOpenChange,
  entry,
  defaultLedgerType,
  accountGroups,
  loading,
  onSubmit,
}: LedgerEntryDialogProps) {
  const isEdit = !!entry;
  const [ledgerType, setLedgerType] = useState<LedgerType | "">(
    entry?.ledgerType ?? defaultLedgerType,
  );
  const [supplierId, setSupplierId] = useState(entry?.supplierId ?? "");
  const [supplierLabel, setSupplierLabel] = useState(entry?.supplierName ?? "");
  // a bank entry's account, or the account a supplier was paid from
  const [bankAccountId, setBankAccountId] = useState(
    entry?.bankAccountId ?? entry?.paidFromAccountId ?? "",
  );
  const [bankAccountLabel, setBankAccountLabel] = useState(() => {
    if (entry?.bankName) return `${entry.bankName} — ${entry.accountName}`;
    if (entry?.paidFromBankName)
      return `${entry.paidFromBankName} — ${entry.paidFromAccountName}`;
    return "";
  });
  const [bsDate, setBsDate] = useState(entry?.bsDate ?? "");
  const [adDate, setAdDate] = useState(() => {
    if (!entry) return "";
    try {
      return BSToAD(entry.bsDate);
    } catch {
      return "";
    }
  });
  const [entryType, setEntryType] = useState<"dr" | "cr" | "">(
    entry?.entryType ?? "",
  );
  const [amountRs, setAmountRs] = useState(
    entry ? String(entry.amount / 100) : "",
  );
  const [paymentType, setPaymentType] = useState<LedgerPaymentType | "">(
    entry?.paymentType === "cash" || entry?.paymentType === "bank"
      ? entry.paymentType
      : "",
  );
  const [accountGroupId, setAccountGroupId] = useState(
    entry?.accountGroupId ?? "",
  );
  const [description, setDescription] = useState(entry?.description ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

  const spec = ledgerType ? LEDGER_TYPES[ledgerType] : null;
  const searchSuppliers = useSupplierSearch();
  const searchBankAccounts = useBankAccountSearch();
  const { data: bankAccounts } = useBankAccountsDropdown();

  // Only a supplier payment (a debit) moves money, so only it is paid by
  // cash or bank; a bank payment also says which account it left from.
  const isSupplierPayment = !!spec?.paymentType && entryType === "dr";
  const isBankPayment = isSupplierPayment && paymentType === "bank";
  const needsBankAccount = spec?.party === "bankAccount" || isBankPayment;
  const defaultBankAccount = bankAccounts?.find((a) => a.isDefault);
  const effectiveBankAccountId =
    bankAccountId || (needsBankAccount ? (defaultBankAccount?.id ?? "") : "");
  const effectiveBankAccountLabel =
    bankAccountLabel ||
    (needsBankAccount && defaultBankAccount
      ? `${defaultBankAccount.bankName} — ${defaultBankAccount.accountName}`
      : "");

  // A payment recorded before payments were linked to their cash/bank side:
  // its money can't change here (the server refuses it too), since the old
  // cash/bank entry would stay and the payment would be counted twice.
  const isUnlinkedPayment =
    isEdit &&
    entry.ledgerType === "supplier" &&
    !!entry.paymentType &&
    !entry.counterEntryId;

  const groupsById = useMemo(
    () => new Map(accountGroups.map((g) => [g.id, g])),
    [accountGroups],
  );
  const searchGroups = useCallback(
    async (q: string) =>
      buildTreeOptions(accountGroups, q, { rootLabel: NO_GROUP_LABEL }),
    [accountGroups],
  );

  const clearError = (field: keyof LedgerEntryInput) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  function handleLedgerTypeChange(value: string | null) {
    if (!value) return;
    setLedgerType(value as LedgerType);
    // the other ledger's party and supplier-only fields don't carry over
    setSupplierId("");
    setSupplierLabel("");
    setBankAccountId("");
    setBankAccountLabel("");
    setPaymentType("");
    setAccountGroupId("");
    setErrors({});
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerType) {
      setErrors({ ledgerType: "Choose a ledger" });
      return;
    }
    // A bank payment says which account the money left from. Not checked in
    // the shared schema: an unlinked older payment keeps its separate
    // cash/bank entry, so it has no account to pick here.
    if (isBankPayment && !isUnlinkedPayment && !effectiveBankAccountId) {
      setErrors({ bankAccountID: "Choose the bank account it was paid from" });
      return;
    }
    const parsed = ledgerEntryInputSchema.safeParse({
      ledgerType,
      date: adDate,
      bsDate,
      entryType: entryType || undefined,
      amount: amountRs === "" ? undefined : Number(amountRs),
      description: description.trim() || undefined,
      supplierID:
        spec?.party === "supplier" ? supplierId || undefined : undefined,
      bankAccountID:
        needsBankAccount && !isUnlinkedPayment
          ? effectiveBankAccountId || undefined
          : undefined,
      accountGroupID: spec?.accountGroup
        ? accountGroupId || undefined
        : undefined,
      paymentType: isSupplierPayment ? paymentType || undefined : undefined,
      // a link to a purchase isn't edited here; keep it
      stockInID: entry?.stockInId ?? undefined,
    });
    if (!parsed.success) {
      const tree = z.treeifyError(parsed.error).properties;
      setErrors({
        ledgerType: tree?.ledgerType?.errors[0],
        bsDate: tree?.bsDate?.errors[0] ?? tree?.date?.errors[0],
        entryType: tree?.entryType?.errors[0],
        amount: tree?.amount?.errors[0],
        description: tree?.description?.errors[0],
        supplierID: tree?.supplierID?.errors[0],
        bankAccountID: tree?.bankAccountID?.errors[0],
        accountGroupID: tree?.accountGroupID?.errors[0],
        paymentType: tree?.paymentType?.errors[0],
      });
      return;
    }
    setErrors({});
    try {
      await onSubmit(parsed.data);
      onOpenChange(false);
    } catch (err) {
      const data = (err as AxiosError<APIError>).response?.data;
      if (data?.errors?.length) setErrors(mapFieldErrors(data));
    }
  };

  return (
    <AdminDrawer
      open={open}
      onOpenChange={onOpenChange}
      variant="modal"
      className="sm:max-w-xl"
      title={isEdit ? "Edit Ledger Entry" : "New Ledger Entry"}
      description={
        isEdit
          ? "Change this entry. A supplier payment's cash/bank side follows it."
          : "Record an entry in the cash, bank or supplier ledger."
      }
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            className={adminSecondaryButtonClass}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="ledger-entry-form"
            disabled={loading}
            className={adminPrimaryButtonClass}
          >
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Save Entry"}
          </button>
        </div>
      }
    >
      <form
        id="ledger-entry-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 px-8 py-10"
      >
        <AccountingFormSection title="Entry details">
          <AccountingFormField
            label="Ledger"
            required
            error={errors.ledgerType}
          >
            <Select
              value={ledgerType}
              onValueChange={handleLedgerTypeChange}
              disabled={isEdit}
            >
              <SelectTrigger
                className={accountingSelectTriggerClass}
                aria-label="Ledger"
              >
                <SelectValue placeholder="Choose a ledger">
                  {ledgerType
                    ? LEDGER_TYPES[ledgerType].label
                    : "Choose a ledger"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ledgerTypeValues.map((t) => (
                  <SelectItem key={t} value={t}>
                    {LEDGER_TYPES[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEdit && (
              <p className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.5)]">
                To move an entry to another ledger, delete it and add it there.
              </p>
            )}
          </AccountingFormField>

          {spec?.party === "supplier" && (
            <AccountingFormField
              label="Supplier"
              required
              error={errors.supplierID}
            >
              <SearchableSelect
                value={supplierId}
                onChange={(v, label) => {
                  setSupplierId(v);
                  setSupplierLabel(label);
                  clearError("supplierID");
                }}
                onSearch={searchSuppliers}
                selectedLabel={supplierLabel}
                placeholder="Search supplier…"
              />
            </AccountingFormField>
          )}

          {spec?.party === "bankAccount" && (
            <AccountingFormField
              label="Bank account"
              required
              error={errors.bankAccountID}
            >
              <SearchableSelect
                value={effectiveBankAccountId}
                onChange={(v, label) => {
                  setBankAccountId(v);
                  setBankAccountLabel(label);
                  clearError("bankAccountID");
                }}
                onSearch={searchBankAccounts}
                selectedLabel={effectiveBankAccountLabel}
                placeholder="Search bank accounts…"
              />
            </AccountingFormField>
          )}

          {spec && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AccountingFormField
                  label="Date (BS)"
                  required
                  error={errors.bsDate}
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.4)]">
                      <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <NepaliDatePicker
                      inputClassName={cn(
                        accountingFieldInputClass,
                        "pl-9",
                        errors.bsDate && "border-[#9a3412]",
                      )}
                      value={bsDate}
                      onChange={(v: string) => {
                        setBsDate(v);
                        clearError("bsDate");
                        try {
                          setAdDate(BSToAD(v));
                        } catch (err) {
                          toast.error(
                            err instanceof Error ? err.message : "Invalid date",
                          );
                        }
                      }}
                      options={{ calenderLocale: "en", valueLocale: "en" }}
                    />
                  </div>
                </AccountingFormField>

                <AccountingFormField
                  label="Entry type"
                  required
                  error={errors.entryType}
                >
                  <Select
                    value={entryType}
                    disabled={isUnlinkedPayment}
                    onValueChange={(v) => {
                      setEntryType(v as "dr" | "cr");
                      clearError("entryType");
                      if (v === "cr") {
                        setPaymentType("");
                        clearError("paymentType");
                      }
                    }}
                  >
                    <SelectTrigger
                      className={accountingSelectTriggerClass}
                      aria-label="Entry type"
                    >
                      <SelectValue placeholder="Select type">
                        {entryType
                          ? ENTRY_TYPE_LABELS[ledgerType as LedgerType][
                              entryType
                            ]
                          : "Select type"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cr">
                        {ENTRY_TYPE_LABELS[ledgerType as LedgerType].cr}
                      </SelectItem>
                      <SelectItem value="dr">
                        {ENTRY_TYPE_LABELS[ledgerType as LedgerType].dr}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </AccountingFormField>
              </div>

              <AccountingFormField
                label="Amount (Rs.)"
                htmlFor="ledger-amount"
                required
                error={errors.amount}
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.45)]">
                    Rs.
                  </span>
                  <input
                    id="ledger-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amountRs}
                    disabled={isUnlinkedPayment}
                    onChange={(e) => {
                      setAmountRs(e.target.value);
                      clearError("amount");
                    }}
                    className={cn(
                      accountingFieldInputClass,
                      "pl-10",
                      errors.amount && "border-[#9a3412]",
                    )}
                  />
                </div>
              </AccountingFormField>

              {isUnlinkedPayment && (
                <p className="-mt-3 font-(family-name:--font-dm-sans) text-xs text-[#9a3412]">
                  This payment was recorded before cash/bank entries were linked
                  to payments, so its amount, type and payment type are fixed.
                  Delete it and enter it again to change them.
                </p>
              )}

              {isSupplierPayment && (
                <AccountingFormField
                  label="Paid by"
                  required
                  error={errors.paymentType}
                >
                  <div
                    role="radiogroup"
                    aria-label="Paid by"
                    className="grid grid-cols-2 gap-3"
                  >
                    {PAYMENT_OPTIONS.map((option) => {
                      const checked = paymentType === option.value;
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-(--brand-green)/30",
                            checked
                              ? "border-(--brand-green) bg-[rgba(47,78,64,0.05)]"
                              : "border-[rgba(47,78,64,0.18)] bg-white hover:border-(--brand-green)",
                            isUnlinkedPayment &&
                              "cursor-not-allowed opacity-60 hover:border-[rgba(47,78,64,0.18)]",
                            errors.paymentType &&
                              !checked &&
                              "border-[#9a3412]",
                          )}
                        >
                          <input
                            type="radio"
                            name="ledger-payment-type"
                            value={option.value}
                            checked={checked}
                            disabled={isUnlinkedPayment}
                            onChange={() => {
                              setPaymentType(option.value);
                              clearError("paymentType");
                            }}
                            className="sr-only"
                          />
                          <span
                            aria-hidden
                            className={cn(
                              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              checked
                                ? "border-(--brand-green)"
                                : "border-[rgba(47,78,64,0.35)]",
                            )}
                          >
                            {checked && (
                              <span className="h-2 w-2 rounded-full bg-(--brand-green)" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-(family-name:--font-dm-sans) text-sm font-semibold text-(--brand-ink)">
                              {option.label}
                            </span>
                            <span className="mt-0.5 block font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.55)]">
                              {option.hint}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </AccountingFormField>
              )}

              {isBankPayment && !isUnlinkedPayment && (
                <AccountingFormField
                  label="Paid from account"
                  required
                  error={errors.bankAccountID}
                >
                  <SearchableSelect
                    value={effectiveBankAccountId}
                    onChange={(v, label) => {
                      setBankAccountId(v);
                      setBankAccountLabel(label);
                      clearError("bankAccountID");
                    }}
                    onSearch={searchBankAccounts}
                    selectedLabel={effectiveBankAccountLabel}
                    placeholder="Search bank accounts…"
                  />
                </AccountingFormField>
              )}

              {spec.accountGroup && (
                <AccountingFormField
                  label="Account group"
                  optional
                  error={errors.accountGroupID}
                >
                  <SearchableSelect
                    value={accountGroupId || ROOT_OPTION_VALUE}
                    onChange={(v) => {
                      setAccountGroupId(v === ROOT_OPTION_VALUE ? "" : v);
                      clearError("accountGroupID");
                    }}
                    onSearch={searchGroups}
                    selectedLabel={
                      accountGroupId
                        ? getPathLabel(groupsById, accountGroupId) ||
                          entry?.accountGroupName ||
                          ""
                        : NO_GROUP_LABEL
                    }
                    placeholder="Search groups…"
                    debounceMs={0}
                  />
                </AccountingFormField>
              )}

              <AccountingFormField
                label="Narration"
                htmlFor="ledger-description"
                optional
                error={errors.description}
              >
                <textarea
                  id="ledger-description"
                  placeholder="e.g. Payment for Invoice #1023"
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearError("description");
                  }}
                  className={cn(
                    accountingFieldInputClass,
                    "resize-none",
                    errors.description && "border-[#9a3412]",
                  )}
                />
              </AccountingFormField>
            </>
          )}
        </AccountingFormSection>
      </form>
    </AdminDrawer>
  );
}
