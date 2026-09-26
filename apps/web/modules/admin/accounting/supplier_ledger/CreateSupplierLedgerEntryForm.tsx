"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BSToAD } from "bikram-sambat-js";
import {
  CreateSupplierLedgerEntryInput,
  createSupplierLedgerEntryInput,
} from "@repo/types";
import z from "zod";
import { AxiosError } from "axios";
import { APIError } from "@repo/types";

import { mapFieldErrors } from "@/utils/api";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
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
import { useBankAccountsDropdown } from "@/hooks/queries/admin/banks/bank_ledger/useBankAccountsDropdown";

const PAYMENT_TYPE_SUGGESTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "cheque", label: "Cheque" },
  { value: "esewa", label: "eSewa" },
] as const;

interface CreateSupplierLedgerEntryFormProps {
  open: boolean;
  loading: boolean;
  defaultSupplierId?: string;
  onOpenChange: (open: boolean) => void;
  createLedgerEntry: (
    data: CreateSupplierLedgerEntryInput & { supplierID: string },
  ) => Promise<void>;
}

export function CreateSupplierLedgerEntryForm({
  open,
  loading,
  defaultSupplierId,
  onOpenChange,
  createLedgerEntry,
}: CreateSupplierLedgerEntryFormProps) {
  const [supplierId, setSupplierId] = useState(defaultSupplierId ?? "");
  const [supplierLabel, setSupplierLabel] = useState("");
  const [bsDate, setBsDate] = useState("");
  const [adDate, setAdDate] = useState("");
  const [entryType, setEntryType] = useState<"dr" | "cr" | "">("");
  const [amountRs, setAmountRs] = useState("");
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [paymentType, setPaymentType] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [bankAccountLabel, setBankAccountLabel] = useState("");
  const [errors, setErrors] =
    useState<Partial<Record<keyof CreateSupplierLedgerEntryInput, string>>>();

  const searchSuppliers = useSupplierSearch();
  const searchBankAccounts = useBankAccountSearch();
  const { data: bankAccounts } = useBankAccountsDropdown();

  // Only a payment (dr) moves money, so only a payment takes a payment type.
  const isPayment = entryType === "dr";
  const isBankMode = isPayment && paymentType.trim().toLowerCase() === "bank";
  const defaultBankAccount = bankAccounts?.find((a) => a.isDefault);
  const effectiveBankAccountId =
    bankAccountId || (isBankMode ? (defaultBankAccount?.id ?? "") : "");
  const effectiveBankAccountLabel =
    bankAccountLabel ||
    (isBankMode && defaultBankAccount
      ? `${defaultBankAccount.bankName} — ${defaultBankAccount.accountName}`
      : "");

  const resetForm = () => {
    setSupplierId(defaultSupplierId ?? "");
    setSupplierLabel("");
    setBsDate("");
    setAdDate("");
    setEntryType("");
    setAmountRs("");
    setDescription(undefined);
    setPaymentType("");
    setBankAccountId("");
    setBankAccountLabel("");
    setErrors({});
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Please select a supplier.");
      return;
    }
    if (isBankMode && !effectiveBankAccountId) {
      toast.error("Please select a bank account.");
      return;
    }

    const validateFields = createSupplierLedgerEntryInput.safeParse({
      date: adDate,
      bsDate,
      entryType: entryType as "dr" | "cr",
      amount: Number(amountRs),
      description: description,
      paymentType: isPayment ? paymentType : undefined,
      bankAccountID: isBankMode ? effectiveBankAccountId : undefined,
    });
    if (!validateFields.success) {
      const tree = z.treeifyError(validateFields.error).properties;

      setErrors({
        date: tree?.date?.errors[0],
        bsDate: tree?.bsDate?.errors[0],
        entryType: tree?.entryType?.errors[0],
        amount: tree?.amount?.errors[0],
        description: tree?.description?.errors[0],
        paymentType: tree?.paymentType?.errors[0],
      });
      return;
    }
    const data = validateFields.data;
    setErrors({});
    try {
      await createLedgerEntry({
        supplierID: supplierId ?? "",
        ...data,
      });
      resetForm();
      onOpenChange(false);
    } catch (err) {
      const error = err as AxiosError<APIError>;
      const data = error.response?.data;
      if (data?.errors?.length) {
        setErrors(mapFieldErrors(data));
      }
    }
  };

  return (
    <AdminDrawer
      open={open}
      onOpenChange={handleOpenChange}
      variant="modal"
      className="sm:max-w-xl"
      title="New Supplier Entry"
      description="Record a purchase (credit) or payment (debit) against a supplier."
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            className={adminSecondaryButtonClass}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="supplier-ledger-entry-form"
            disabled={loading}
            className={adminPrimaryButtonClass}
          >
            {loading ? "Saving…" : "Save Entry"}
          </button>
        </div>
      }
    >
      <form
        id="supplier-ledger-entry-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 px-8 py-10"
      >
        <AccountingFormSection title="Entry details">
          {!defaultSupplierId && (
            <AccountingFormField label="Supplier" required>
              <SearchableSelect
                value={supplierId}
                onChange={(v, label) => {
                  setSupplierId(v);
                  setSupplierLabel(label);
                }}
                onSearch={searchSuppliers}
                selectedLabel={supplierLabel}
                placeholder="Search supplier…"
              />
            </AccountingFormField>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AccountingFormField
              label="Date (BS)"
              required
              error={errors?.bsDate}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.4)]">
                  <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <NepaliDatePicker
                  inputClassName={cn(
                    accountingFieldInputClass,
                    "pl-9",
                    errors?.bsDate && "border-[#9a3412]",
                  )}
                  value={bsDate}
                  onChange={(v: string) => {
                    setBsDate(v);
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
              label="Entry Type"
              required
              error={errors?.entryType}
            >
              <Select
                value={entryType}
                onValueChange={(v) => {
                  setEntryType(v as "dr" | "cr");
                  if (v === "cr") {
                    setPaymentType("");
                    setBankAccountId("");
                    setBankAccountLabel("");
                    setErrors((prev) => ({ ...prev, paymentType: undefined }));
                  }
                }}
              >
                <SelectTrigger className={accountingSelectTriggerClass}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cr">
                    Credit — Purchase / Payable added
                  </SelectItem>
                  <SelectItem value="dr">
                    Debit — Payment made to supplier
                  </SelectItem>
                </SelectContent>
              </Select>
            </AccountingFormField>
          </div>

          <AccountingFormField
            label="Amount (Rs.)"
            htmlFor="supplier-amount"
            required
            error={errors?.amount}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.45)]">
                Rs.
              </span>
              <input
                id="supplier-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amountRs}
                onChange={(e) => setAmountRs(e.target.value)}
                className={cn(
                  accountingFieldInputClass,
                  "pl-10",
                  errors?.amount && "border-[#9a3412]",
                )}
              />
            </div>
          </AccountingFormField>

          {isPayment && (
            <AccountingFormField
              label="Payment Type"
              htmlFor="supplier-payment-type"
              required
              error={errors?.paymentType}
            >
              <input
                id="supplier-payment-type"
                type="text"
                placeholder="Type a custom payment method…"
                value={paymentType}
                onChange={(e) => {
                  setPaymentType(e.target.value);
                  setErrors((prev) => ({ ...prev, paymentType: undefined }));
                }}
                className={cn(
                  accountingFieldInputClass,
                  errors?.paymentType && "border-[#9a3412]",
                )}
              />
              <div className="mt-2.5 flex flex-wrap gap-2">
                {PAYMENT_TYPE_SUGGESTIONS.map((option) => {
                  const isSelected =
                    paymentType.trim().toLowerCase() === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setPaymentType(option.value);
                        setErrors((prev) => ({
                          ...prev,
                          paymentType: undefined,
                        }));
                      }}
                      className={cn(
                        "border px-3 py-1.5 font-(family-name:--font-dm-sans) text-xs font-semibold uppercase tracking-[0.06em] transition-colors",
                        isSelected
                          ? "border-(--brand-green) bg-(--brand-green) text-white"
                          : "border-[rgba(47,78,64,0.18)] bg-white text-[rgba(47,78,64,0.65)] hover:border-(--brand-green) hover:text-(--brand-green)",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </AccountingFormField>
          )}

          {isBankMode && (
            <AccountingFormField label="Bank Account" required>
              <SearchableSelect
                value={effectiveBankAccountId}
                onChange={(v, label) => {
                  setBankAccountId(v);
                  setBankAccountLabel(label);
                }}
                onSearch={searchBankAccounts}
                selectedLabel={effectiveBankAccountLabel}
                placeholder="Search bank accounts…"
              />
            </AccountingFormField>
          )}

          <AccountingFormField
            label="Narration"
            htmlFor="supplier-description"
            optional
            error={errors?.description}
          >
            <textarea
              id="supplier-description"
              placeholder="e.g. Payment for Invoice #1023"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(
                accountingFieldInputClass,
                "resize-none",
                errors?.description && "border-[#9a3412]",
              )}
            />
          </AccountingFormField>
        </AccountingFormSection>
      </form>
    </AdminDrawer>
  );
}
