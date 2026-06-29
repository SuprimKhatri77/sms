"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BankAccountForDropdown,
  CreateBankLedgerEntryInput,
  createBankLedgerEntrySchema,
} from "@repo/types";
import { CalendarDays } from "lucide-react";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { cn } from "@/lib/utils";
import { BSToAD } from "bikram-sambat-js";
import "nepali-datepicker-reactjs/dist/index.css";
import { useForm } from "@tanstack/react-form-nextjs";
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

interface CreateLedgerEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: BankAccountForDropdown[];
  defaultAccountId?: string;
  createLedgerEntry: (
    data: CreateBankLedgerEntryInput & { accountID: string },
  ) => void;
}

export function CreateLedgerEntryForm({
  open,
  onOpenChange,
  accounts,
  defaultAccountId,
  createLedgerEntry,
}: CreateLedgerEntryFormProps) {
  const [bankAccountId, setBankAccountId] = useState(defaultAccountId ?? "");
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateBankLedgerEntryInput, string>>
  >({});

  useEffect(() => {
    if (defaultAccountId) {
      setTimeout(() => {
        setBankAccountId(defaultAccountId);
      }, 0);
    }
  }, [defaultAccountId]);

  const form = useForm({
    defaultValues: {
      date: "",
      bsDate: "",
      entryType: "" as "cr" | "dr" | "",
      amount: "",
      description: "",
    },
    validators: {
      onSubmit: createBankLedgerEntrySchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        await createLedgerEntry({
          accountID: bankAccountId,
          ...value,
          entryType: value.entryType as "cr" | "dr",
        });
        formApi.reset();
        reset();
        onOpenChange(false);
      } catch (err) {
        const error = err as AxiosError<APIError>;
        const data = error.response?.data;
        if (data?.errors?.length) {
          setErrors(mapFieldErrors(data));
        }
      }
    },
  });

  function reset() {
    setBankAccountId(defaultAccountId ?? "");
    setErrors({});
  }

  const handleClose = () => {
    form.reset();
    reset();
    onOpenChange(false);
  };

  const showAccountSelector = !defaultAccountId;

  return (
    <AdminDrawer
      open={open}
      onOpenChange={(next) => !next && handleClose()}
      title="New Ledger Entry"
      description="Record a manual debit or credit transaction against a bank account."
      footer={
        <div className="flex justify-end gap-2">
          <form.Subscribe
            selector={(formState) => [
              formState.isSubmitting,
              formState.canSubmit,
            ]}
          >
            {([isSubmitting, canSubmit]) => (
              <>
                <button
                  type="button"
                  disabled={isSubmitting}
                  className={adminSecondaryButtonClass}
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canSubmit || isSubmitting}
                  className={adminPrimaryButtonClass}
                  onClick={() => form.handleSubmit()}
                >
                  {isSubmitting ? "Saving…" : "Save Entry"}
                </button>
              </>
            )}
          </form.Subscribe>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-8 px-8 py-10"
      >
        <AccountingFormSection title="Entry details">
          {showAccountSelector && (
            <AccountingFormField label="Bank Account" required>
              <Select
                value={bankAccountId}
                onValueChange={(val) => setBankAccountId(val ?? "")}
              >
                <SelectTrigger className={accountingSelectTriggerClass}>
                  <SelectValue placeholder="Select an account">
                    {
                      accounts.find((a) => a.id === bankAccountId)
                        ?.accountName
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.bankName} — {a.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccountingFormField>
          )}

          <form.Field name="date">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? errors.date;
              return (
                <AccountingFormField
                  label="Date (AD)"
                  htmlFor="ledger-date"
                  error={mergedError}
                >
                  <input
                    id="ledger-date"
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={cn(
                      accountingFieldInputClass,
                      mergedError && "border-[#9a3412]",
                    )}
                  />
                </AccountingFormField>
              );
            }}
          </form.Field>

          <form.Field name="bsDate">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? errors.bsDate;

              return (
                <AccountingFormField
                  label="BS Date"
                  error={mergedError}
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.4)]">
                      <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <NepaliDatePicker
                      inputClassName={cn(
                        accountingFieldInputClass,
                        "pl-9",
                        mergedError && "border-[#9a3412]",
                      )}
                      value={field.state.value}
                      onChange={(bsValue: string) => {
                        field.handleChange(bsValue);
                        try {
                          const adValue = BSToAD(bsValue);
                          form.setFieldValue("date", adValue);
                        } catch (err) {
                          toast.error(
                            err instanceof Error
                              ? err.message
                              : "Something went wrong while setting date",
                          );
                        }
                      }}
                      options={{ calenderLocale: "en", valueLocale: "en" }}
                    />
                  </div>
                </AccountingFormField>
              );
            }}
          </form.Field>

          <form.Field name="entryType">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? errors.entryType;

              return (
                <AccountingFormField
                  label="Entry Type"
                  required
                  error={mergedError}
                >
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as "cr" | "dr")
                    }
                  >
                    <SelectTrigger className={accountingSelectTriggerClass}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cr">Credit (CR)</SelectItem>
                      <SelectItem value="dr">Debit (DR)</SelectItem>
                    </SelectContent>
                  </Select>
                </AccountingFormField>
              );
            }}
          </form.Field>

          <form.Field name="amount">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? errors.amount;
              return (
                <AccountingFormField
                  label="Amount (Rs.)"
                  htmlFor="ledger-amount"
                  required
                  error={mergedError}
                >
                  <input
                    id="ledger-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={cn(
                      accountingFieldInputClass,
                      mergedError && "border-[#9a3412]",
                    )}
                  />
                </AccountingFormField>
              );
            }}
          </form.Field>

          <form.Field name="description">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? errors.description;
              return (
                <AccountingFormField
                  label="Description"
                  htmlFor="ledger-description"
                  optional
                  error={mergedError}
                >
                  <textarea
                    id="ledger-description"
                    placeholder="Add a note about this transaction..."
                    rows={3}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={cn(
                      accountingFieldInputClass,
                      "resize-none",
                      mergedError && "border-[#9a3412]",
                    )}
                  />
                </AccountingFormField>
              );
            }}
          </form.Field>
        </AccountingFormSection>
      </form>
    </AdminDrawer>
  );
}
