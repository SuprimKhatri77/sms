"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form-nextjs";
import { AxiosError } from "axios";
import { APIError } from "@repo/types";
import {
  CreateBankInput,
  createBankInputSchema,
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

interface BankCreateDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function BankCreateDialog({
  open,
  loading,
  onClose,
  onCreate,
}: BankCreateDialogProps) {
  const [error, setError] = useState<
    Partial<Record<keyof CreateBankInput, string>>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: { name: "" },
    validators: { onSubmit: createBankInputSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await onCreate(value.name);
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
    if (open) {
      form.reset({ name: "" });
      setError({});
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleClose = () => {
    form.reset({ name: "" });
    setError({});
    onClose();
  };

  return (
    <AdminDrawer
      open={open}
      onOpenChange={(next) => !next && handleClose()}
      title="Add Bank"
      description="Create a new bank for payment processing."
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
            {(name) => (
              <button
                type="button"
                onClick={() => form.handleSubmit()}
                disabled={loading || !name.trim()}
                className={adminPrimaryButtonClass}
              >
                {loading ? "Adding…" : "Add Bank"}
              </button>
            )}
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
                  htmlFor="create-bank-name"
                  required
                  error={mergedError}
                >
                  <input
                    id="create-bank-name"
                    ref={inputRef}
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") form.handleSubmit();
                      if (e.key === "Escape") handleClose();
                    }}
                    placeholder="e.g. Nabil Bank"
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
