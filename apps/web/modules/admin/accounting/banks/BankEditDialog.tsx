"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form-nextjs";
import { AxiosError } from "axios";
import { APIError, Bank } from "@repo/types";
import {
  UpdateBankInput,
  updateBankInputSchema,
} from "@repo/types/admin/accounting/bank";

import { AdminDrawer } from "@/components/admin/admin-drawer";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { mapFieldErrors } from "@/utils/api";
import { cn } from "@/lib/utils";
import {
  AccountingFormField,
  AccountingFormSection,
  accountingFieldInputClass,
} from "../shared/accounting-styles";

interface BankEditDialogProps {
  bank: Bank | null;
  loading: boolean;
  onClose: () => void;
  onSave: (id: string, name: string) => Promise<void>;
}

export function BankEditDialog({
  bank,
  loading,
  onClose,
  onSave,
}: BankEditDialogProps) {
  const [error, setError] = useState<
    Partial<Record<keyof UpdateBankInput, string>>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: { name: bank?.name ?? "" },
    validators: { onSubmit: updateBankInputSchema },
    onSubmit: async ({ value, formApi }) => {
      if (!bank) return;
      try {
        await onSave(bank.id, value.name);
        formApi.reset();
        onClose();
      } catch (err) {
        const axiosError = err as AxiosError<APIError>;
        const data = axiosError.response?.data;
        if (data?.errors?.length) {
          setError(mapFieldErrors(data));
        }
      }
    },
  });

  useEffect(() => {
    if (bank) {
      form.reset({ name: bank.name });
      setTimeout(() => setError({}), 0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [bank]);

  const handleClose = () => {
    onClose();
  };

  return (
    <AdminDrawer
      open={!!bank}
      onOpenChange={(next) => !next && handleClose()}
      title="Edit Bank"
      description="Update the bank name."
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className={adminSecondaryButtonClass}
          >
            Cancel
          </button>
          <form.Subscribe selector={(s) => s.values.name}>
            {(name) => {
              const unchanged = name.trim() === bank?.name;
              return (
                <button
                  type="button"
                  onClick={() => form.handleSubmit()}
                  disabled={loading || unchanged || !name.trim()}
                  className={adminPrimaryButtonClass}
                >
                  {loading ? "Saving…" : "Save Changes"}
                </button>
              );
            }}
          </form.Subscribe>
        </div>
      }
    >
      <div className="flex flex-col gap-8 px-8 py-10">
        <AccountingFormSection title="Bank details">
          <form.Field name="name">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? error.name;
              return (
                <AccountingFormField
                  label="Bank Name"
                  htmlFor="edit-bank-name"
                  required
                  error={mergedError}
                >
                  <input
                    id="edit-bank-name"
                    ref={inputRef}
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") form.handleSubmit();
                      if (e.key === "Escape") handleClose();
                    }}
                    disabled={loading}
                    className={cn(
                      accountingFieldInputClass,
                      mergedError && "border-[#9a3412]",
                    )}
                  />
                </AccountingFormField>
              );
            }}
          </form.Field>
        </AccountingFormSection>
      </div>
    </AdminDrawer>
  );
}
