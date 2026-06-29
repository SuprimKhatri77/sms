"use client";

import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { APIError, createSupplierSchema } from "@repo/types";
import z from "zod";

import { AdminDrawer } from "@/components/admin/admin-drawer";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { mapFieldErrors } from "@/utils/api";
import { cn } from "@/lib/utils";
import { CreateSupplierInput } from "./types";
import {
  AccountingFormField,
  AccountingFormSection,
  accountingFieldInputClass,
} from "../shared/accounting-styles";

interface SupplierCreateDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onCreate: (data: CreateSupplierInput) => Promise<void>;
}

export function SupplierCreateDialog({
  open,
  loading,
  onClose,
  onCreate,
}: SupplierCreateDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [vatNo, setVatNo] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] =
    useState<Partial<Record<keyof CreateSupplierInput, string>>>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCompanyName("");
      setVatNo("");
      setPhone("");
      setErrors({});
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = async () => {
    const validateFields = createSupplierSchema.safeParse({
      companyName: companyName.trim(),
      vatNo: vatNo.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    if (!validateFields.success) {
      const tree = z.treeifyError(validateFields.error).properties;
      setErrors({
        companyName: tree?.companyName?.errors[0],
        vatNo: tree?.vatNo?.errors[0],
        phone: tree?.phone?.errors[0],
      });
      return;
    }

    setErrors({});
    try {
      await onCreate({
        companyName: companyName.trim(),
        vatNo: vatNo.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setCompanyName("");
      setVatNo("");
      setPhone("");
      setErrors({});
      onClose();
    } catch (err) {
      const error = err as AxiosError<APIError>;
      const data = error.response?.data;
      if (data?.errors?.length) {
        setErrors(mapFieldErrors(data));
      }
    }
  };

  const handleClose = () => {
    setCompanyName("");
    setVatNo("");
    setPhone("");
    setErrors({});
    onClose();
  };

  return (
    <AdminDrawer
      open={open}
      onOpenChange={(next) => !next && handleClose()}
      title="Add Supplier"
      description="Fill in the details to add a new supplier."
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
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !companyName.trim()}
            className={adminPrimaryButtonClass}
          >
            {loading ? "Creating…" : "Add Supplier"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-8 px-8 py-10">
        <AccountingFormSection title="Supplier details">
          <AccountingFormField
            label="Company Name"
            htmlFor="create-supplier-company"
            required
            error={errors?.companyName}
          >
            <input
              id="create-supplier-company"
              ref={inputRef}
              type="text"
              placeholder="e.g. Nepal Trading Co."
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                setErrors((prev) => ({ ...prev, companyName: undefined }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
                if (e.key === "Escape") handleClose();
              }}
              disabled={loading}
              className={cn(
                accountingFieldInputClass,
                errors?.companyName && "border-[#9a3412]",
              )}
            />
          </AccountingFormField>

          <AccountingFormField
            label="VAT No."
            htmlFor="create-supplier-vat"
            optional
            error={errors?.vatNo}
          >
            <input
              id="create-supplier-vat"
              type="text"
              placeholder="e.g. 300123456"
              value={vatNo}
              onChange={(e) => setVatNo(e.target.value)}
              disabled={loading}
              className={cn(
                accountingFieldInputClass,
                "font-mono",
                errors?.vatNo && "border-[#9a3412]",
              )}
            />
          </AccountingFormField>

          <AccountingFormField
            label="Phone"
            htmlFor="create-supplier-phone"
            optional
            error={errors?.phone}
          >
            <input
              id="create-supplier-phone"
              type="tel"
              placeholder="e.g. 9841000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className={cn(
                accountingFieldInputClass,
                errors?.phone && "border-[#9a3412]",
              )}
            />
          </AccountingFormField>
        </AccountingFormSection>
      </div>
    </AdminDrawer>
  );
}
