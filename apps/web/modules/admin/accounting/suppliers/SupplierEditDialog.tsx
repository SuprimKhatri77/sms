"use client";

import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import {
  APIError,
  Supplier,
  UpdateSupplierInput,
  updateSupplierSchema,
} from "@repo/types";
import z from "zod";

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

interface SupplierEditDialogProps {
  supplier: Supplier | null;
  loading: boolean;
  onClose: () => void;
  onSave: (id: string, data: UpdateSupplierInput) => Promise<void>;
}

export function SupplierEditDialog({
  supplier,
  loading,
  onClose,
  onSave,
}: SupplierEditDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [vatNo, setVatNo] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] =
    useState<Partial<Record<keyof UpdateSupplierInput, string>>>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (supplier) {
      setTimeout(() => {
        setCompanyName(supplier.companyName);
        setVatNo(supplier.vatNo ?? "");
        setPhone(supplier.phone ?? "");
        setErrors({});
      }, 0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [supplier]);

  const handleSave = async () => {
    if (!supplier) {
      toast.error("Supplier not found");
      return;
    }
    const validateFields = updateSupplierSchema.safeParse({
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
      await onSave(supplier.id, {
        companyName: companyName.trim(),
        vatNo: vatNo.trim() || undefined,
        phone: phone.trim() || undefined,
      });
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
    onClose();
  };

  const unchanged =
    supplier &&
    companyName.trim() === supplier.companyName &&
    (vatNo.trim() || undefined) === (supplier.vatNo || undefined) &&
    (phone.trim() || undefined) === (supplier.phone || undefined);

  return (
    <AdminDrawer
      open={!!supplier}
      onOpenChange={(next) => !next && handleClose()}
      title="Edit Supplier"
      description="Update the supplier's details below."
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
            onClick={handleSave}
            disabled={loading || !!unchanged || !companyName.trim()}
            className={adminPrimaryButtonClass}
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-8 px-8 py-10">
        <AccountingFormSection title="Supplier details">
          <AccountingFormField
            label="Company Name"
            htmlFor="edit-supplier-company"
            required
            error={errors?.companyName}
          >
            <input
              id="edit-supplier-company"
              ref={inputRef}
              type="text"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                setErrors((prev) => ({ ...prev, companyName: undefined }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
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
            htmlFor="edit-supplier-vat"
            optional
            error={errors?.vatNo}
          >
            <input
              id="edit-supplier-vat"
              type="text"
              placeholder="e.g. 300123456"
              value={vatNo}
              onChange={(e) => {
                setVatNo(e.target.value);
                setErrors((prev) => ({ ...prev, vatNo: undefined }));
              }}
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
            htmlFor="edit-supplier-phone"
            optional
            error={errors?.phone}
          >
            <input
              id="edit-supplier-phone"
              type="tel"
              placeholder="e.g. 9841000000"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
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
