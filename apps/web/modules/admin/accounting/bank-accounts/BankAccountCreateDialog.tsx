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
import { mapFieldErrors } from "@/utils/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AccountingFormField,
  AccountingFormSection,
  accountingFieldInputClass,
} from "../shared/accounting-styles";
import { SearchableSelect } from "../../inventory/shared/SearchableSelect";
import { useBankSearch } from "../../inventory/shared/useProductSupplierSearch";

interface BankAccountCreateDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onCreate: (
    payload: CreateBankAccountInput & { bankID: string },
  ) => Promise<void>;
}

export function BankAccountCreateDialog({
  open,
  loading,
  onClose,
  onCreate,
}: BankAccountCreateDialogProps) {
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateBankAccountInput, string>>
  >({});
  const [bankID, setBankID] = useState<string>("");
  const [bankLabel, setBankLabel] = useState("");
  const searchBanks = useBankSearch();
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
        setBankLabel("");
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
      setBankLabel("");
      setErrors({});
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleClose = () => {
    form.reset({ accountName: "", accountNumber: "" });
    setBankID("");
    setBankLabel("");
    setErrors({});
    onClose();
  };

  return (
    <AdminDrawer
      open={open}
      onOpenChange={(next) => !next && handleClose()}
      variant="modal"
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
          <AccountingFormField label="Bank" required>
            <SearchableSelect
              value={bankID}
              onChange={(v, label) => {
                setBankID(v);
                setBankLabel(label);
              }}
              onSearch={searchBanks}
              selectedLabel={bankLabel}
              placeholder="Search bank…"
              disabled={loading}
            />
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
