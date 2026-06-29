"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form-nextjs";
import { AxiosError } from "axios";
import { APIError } from "@repo/types";
import {
  CreateBankAccountInput,
  createBankAccountInputSchema,
} from "@repo/types";

import { AdminDrawer } from "@/components/admin/admin-drawer";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { BanksData } from "@/lib/api/banks";
import { mapFieldErrors } from "@/utils/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AccountingFormField,
  AccountingFormSection,
  accountingFieldInputClass,
  accountingSelectTriggerClass,
} from "../shared/accounting-styles";

interface BankAccountCreateDialogProps {
  open: boolean;
  loading: boolean;
  bankOptions: BanksData["banks"];
  loadingOptions: boolean;
  onClose: () => void;
  onCreate: (
    payload: CreateBankAccountInput & { bankID: string },
  ) => Promise<void>;
}

export function BankAccountCreateDialog({
  open,
  loading,
  bankOptions,
  loadingOptions,
  onClose,
  onCreate,
}: BankAccountCreateDialogProps) {
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateBankAccountInput, string>>
  >({});
  const [bankID, setBankID] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      accountName: "",
      accountNumber: "",
    } as CreateBankAccountInput,
    validators: {
      onSubmit: createBankAccountInputSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (!bankID) {
        toast.error("Please select a bank");
        return;
      }
      try {
        await onCreate({ bankID, ...value });
        formApi.reset();
        setBankID("");
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
    if (open) {
      form.reset({ accountName: "", accountNumber: "" });
      setBankID("");
      setErrors({});
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleClose = () => {
    form.reset({ accountName: "", accountNumber: "" });
    setBankID("");
    setErrors({});
    onClose();
  };

  return (
    <AdminDrawer
      open={open}
      onOpenChange={(next) => !next && handleClose()}
      title="Add Bank Account"
      description="Create a new account linked to a bank."
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
          <form.Subscribe selector={(s) => s.values.accountName}>
            {(accountName) => (
              <button
                type="button"
                onClick={() => form.handleSubmit()}
                disabled={loading || !accountName.trim() || !bankID}
                className={adminPrimaryButtonClass}
              >
                {loading ? "Adding…" : "Add Account"}
              </button>
            )}
          </form.Subscribe>
        </div>
      }
    >
      <div className="flex flex-col gap-8 px-8 py-10">
        <AccountingFormSection title="Account details">
          <AccountingFormField
            label="Bank"
            htmlFor="create-bank-select"
            required
          >
            <select
              id="create-bank-select"
              value={bankID}
              onChange={(e) => setBankID(e.target.value)}
              disabled={loading || loadingOptions}
              className={accountingSelectTriggerClass}
            >
              <option value="">
                {loadingOptions ? "Loading banks…" : "Select a bank"}
              </option>
              {bankOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </AccountingFormField>

          <form.Field name="accountName">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? errors.accountName;
              return (
                <AccountingFormField
                  label="Account Name"
                  htmlFor="create-account-name"
                  required
                  error={mergedError}
                >
                  <input
                    id="create-account-name"
                    ref={inputRef}
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") form.handleSubmit();
                      if (e.key === "Escape") handleClose();
                    }}
                    placeholder="e.g. Main Operating Account"
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
                  htmlFor="create-account-number"
                  optional
                  error={mergedError}
                >
                  <input
                    id="create-account-number"
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
