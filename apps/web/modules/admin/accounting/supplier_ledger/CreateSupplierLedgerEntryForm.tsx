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
import { SupplierForDropdown } from "./types";
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

interface CreateSupplierLedgerEntryFormProps {
  open: boolean;
  loading: boolean;
  suppliers: SupplierForDropdown[];
  defaultSupplierId?: string;
  onOpenChange: (open: boolean) => void;
  createLedgerEntry: (
    data: CreateSupplierLedgerEntryInput & { supplierID: string },
  ) => Promise<void>;
}

export function CreateSupplierLedgerEntryForm({
  open,
  loading,
  suppliers,
  defaultSupplierId,
  onOpenChange,
  createLedgerEntry,
}: CreateSupplierLedgerEntryFormProps) {
  const [supplierId, setSupplierId] = useState(defaultSupplierId ?? "");
  const [bsDate, setBsDate] = useState("");
  const [adDate, setAdDate] = useState("");
  const [entryType, setEntryType] = useState<"dr" | "cr" | "">("");
  const [amountRs, setAmountRs] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] =
    useState<Partial<Record<keyof CreateSupplierLedgerEntryInput, string>>>();

  const resetForm = () => {
    setSupplierId(defaultSupplierId ?? "");
    setBsDate("");
    setAdDate("");
    setEntryType("");
    setAmountRs("");
    setDescription("");
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

    const validateFields = createSupplierLedgerEntryInput.safeParse({
      date: adDate,
      bsDate,
      entryType: entryType as "dr" | "cr",
      amount: Number(amountRs),
      description: description.trim() ?? undefined,
    });
    if (!validateFields.success) {
      const tree = z.treeifyError(validateFields.error).properties;

      setErrors({
        date: tree?.date?.errors[0],
        bsDate: tree?.bsDate?.errors[0],
        entryType: tree?.entryType?.errors[0],
        amount: tree?.amount?.errors[0],
        description: tree?.description?.errors[0],
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
              <Select
                value={supplierId}
                onValueChange={(v) => v && setSupplierId(v)}
              >
                <SelectTrigger className={accountingSelectTriggerClass}>
                  <SelectValue placeholder="Select supplier">
                    {suppliers.find((s) => s.id === supplierId)?.companyName ??
                      "Select supplier"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccountingFormField>
          )}

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
              onValueChange={(v) => setEntryType(v as "dr" | "cr")}
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

          <AccountingFormField
            label="Amount (Rs.)"
            htmlFor="supplier-amount"
            required
            error={errors?.amount}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.45)]">
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
