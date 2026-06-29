"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form-nextjs";
import { AxiosError } from "axios";
import {
  APIError,
  BankAccount,
  UpdateBankAccountInput,
  updateBankAccountInputSchema,
} from "@repo/types";

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

interface BankAccountEditDialogProps {
  account: BankAccount | null;
  loading: boolean;
  onClose: () => void;
  onSave: (
    payload: UpdateBankAccountInput & { accountID: string },
  ) => Promise<void>;
}

export function BankAccountEditDialog({
  account,
  loading,
  onClose,
  onSave,
}: BankAccountEditDialogProps) {
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdateBankAccountInput, string>>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      accountName: account?.accountName ?? "",
      accountNumber: account?.accountNumber ?? "",
    } as UpdateBankAccountInput,
    validators: {
      onSubmit: updateBankAccountInputSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (!account) return;
      try {
        await onSave({ accountID: account.id, ...value });
        formApi.reset();
        onClose();
      } catch (err) {
        const error = err as AxiosError<APIError>;
        const data = error.response?.data;
        if (data?.errors?.length) {
          setErrors(mapFieldErrors(data));
        }
      }
    },
  });

  useEffect(() => {
    if (account) {
      form.reset({
        accountName: account.accountName,
        accountNumber: account.accountNumber,
      });
      setTimeout(() => setErrors({}), 0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [account]);

  const handleClose = () => {
    onClose();
  };

  return (
    <AdminDrawer
      open={!!account}
      onOpenChange={(next) => !next && handleClose()}
      title="Edit Account"
      description="Update the account details."
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
          <form.Subscribe selector={(s) => s.values}>
            {(values) => {
              const unchanged =
                values.accountName.trim() === account?.accountName &&
                (values.accountNumber ?? "") ===
                  (account?.accountNumber ?? "");
              return (
                <button
                  type="button"
                  onClick={() => form.handleSubmit()}
                  disabled={loading || unchanged || !values.accountName.trim()}
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
        <AccountingFormSection title="Account details">
          <AccountingFormField label="Bank" htmlFor="edit-bank-readonly">
            <div
              id="edit-bank-readonly"
              className="inline-flex items-center border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)] px-3 py-2 font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.7)]"
            >
              {account?.bankName}
            </div>
          </AccountingFormField>

          <form.Field name="accountName">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? errors.accountName;
              return (
                <AccountingFormField
                  label="Account Name"
                  htmlFor="edit-account-name"
                  required
                  error={mergedError}
                >
                  <input
                    id="edit-account-name"
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

          <form.Field name="accountNumber">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? errors.accountNumber;
              return (
                <AccountingFormField
                  label="Account Number"
                  htmlFor="edit-account-number"
                  optional
                  error={mergedError}
                >
                  <input
                    id="edit-account-number"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. 0012345678901"
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
