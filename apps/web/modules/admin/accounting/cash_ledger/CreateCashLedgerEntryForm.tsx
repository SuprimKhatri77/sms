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
import {
  CreateCashLedgerEntryInput,
  createCashLedgerEntrySchema,
} from "@repo/types";
import { useForm } from "@tanstack/react-form-nextjs";
import { BSToAD } from "bikram-sambat-js";
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

interface CreateCashLedgerEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createLedgerEntry: (data: CreateCashLedgerEntryInput) => Promise<void>;
}

export function CreateCashLedgerEntryForm({
  open,
  onOpenChange,
  createLedgerEntry,
}: CreateCashLedgerEntryFormProps) {
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateCashLedgerEntryInput, string>>
  >({});

  const form = useForm({
    defaultValues: {
      bsDate: "",
      date: "",
      entryType: "" as "dr" | "cr" | "",
      amount: "",
      description: "",
    },
    validators: {
      onSubmit: createCashLedgerEntrySchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.bsDate || !value.date || !value.entryType || !value.amount) {
        toast.error("Please fill in all required fields");
        return;
      }

      const amountPaisa = Number(value.amount);
      if (isNaN(amountPaisa) || amountPaisa <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      try {
        await createLedgerEntry({
          bsDate: value.bsDate,
          date: value.date,
          entryType: value.entryType as "dr" | "cr",
          amount: String(amountPaisa),
          description: value.description ?? undefined,
        });
        form.reset();
        setErrors({});
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

  const handleClose = () => {
    form.reset();
    setErrors({});
    onOpenChange(false);
  };

  return (
    <AdminDrawer
      open={open}
      onOpenChange={(next) => !next && handleClose()}
      title="New Cash Entry"
      description="Record a cash debit or credit transaction."
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
          void form.handleSubmit();
        }}
        className="flex flex-col gap-8 px-8 py-10"
      >
        <AccountingFormSection title="Entry details">
          <form.Field name="bsDate">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? errors.bsDate;
              return (
                <AccountingFormField
                  label="Date (BS)"
                  required
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
                            err instanceof Error ? err.message : "Invalid date",
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

          <form.Field name="date">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? errors.date;
              return (
                <AccountingFormField
                  label="Date (AD)"
                  htmlFor="cash-date"
                  error={mergedError}
                >
                  <input
                    id="cash-date"
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={cn(
                      accountingFieldInputClass,
                      mergedError && "border-[#9a3412]",
                    )}
                  />
                  <span className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
                    Auto-generated from BS date
                  </span>
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
                    onValueChange={(v) => field.handleChange(v as "dr" | "cr")}
                  >
                    <SelectTrigger className={accountingSelectTriggerClass}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cr">Credit (Cash In)</SelectItem>
                      <SelectItem value="dr">Debit (Cash Out)</SelectItem>
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
                  htmlFor="cash-amount"
                  required
                  error={mergedError}
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.45)]">
                      Rs.
                    </span>
                    <input
                      id="cash-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={cn(
                        accountingFieldInputClass,
                        "pl-10",
                        mergedError && "border-[#9a3412]",
                      )}
                    />
                  </div>
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
                  label="Narration"
                  htmlFor="cash-description"
                  optional
                  error={mergedError}
                >
                  <textarea
                    id="cash-description"
                    placeholder="Describe this transaction..."
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
