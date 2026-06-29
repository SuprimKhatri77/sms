"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { BSToAD } from "bikram-sambat-js";
import { cn } from "@/lib/utils";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { Spinner } from "@/components/ui/spinner";
import { inputCls } from "../../students/detail/shared/utils";
import {
  InventoryFormField,
  InventoryFormSection,
  inventoryFieldInputClass,
  inventorySelectTriggerClass,
} from "../shared/InventoryFormField";

import {
  CreateStockInInput,
  CreateStockInResponse,
  createStockInSchema,
  GetProductResponse,
  ListStockInResponse,
  updateStockInSchema,
} from "@repo/types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { mapFieldErrors } from "@/utils/api";
import { useSuppliers } from "@/hooks/queries/admin/suppliers/useSuppliers";
import Link from "next/link";

type StockIn = Extract<ListStockInResponse, { success: true }>["data"][number];
type BackendError = Extract<CreateStockInResponse, { success: false }>;

type StockInFormData = Omit<
  StockIn,
  "id" | "createdAt" | "productName" | "productUnit" | "updatedAt" | "qty"
> & {
  quantity: number;
  supplierID?: string;
  bsDate?: string;
};

type Product = Extract<GetProductResponse, { success: true }>["data"][number];

type Props = {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (data: StockInFormData) => Promise<void>;
  initialData?: StockIn | null;
};

const fieldInputClass = inventoryFieldInputClass;

const emptyForm = {
  invoiceNo: "",
  note: "",
  productID: "",
  supplierID: "",
  quantity: "1",
  rate: "",
  bsDate: "",
  adDate: "",
  date: "",
};

export function StockInDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  products,
}: Props) {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] =
    useState<
      Partial<
        Record<
          keyof CreateStockInInput | "quantity" | "supplierID" | "bsDate",
          string
        >
      >
    >();

  const { data: suppliersData, isPending: suppliersLoading } = useSuppliers(1);
  const suppliers = suppliersData?.suppliers ?? [];

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      if (initialData) {
        setFormData({
          invoiceNo: initialData.invoiceNo ?? "",
          note: initialData.note ?? "",
          productID: initialData.productID ?? "",
          supplierID: "",
          quantity: initialData.qty.toString(),
          rate: (initialData.rate / 100).toString(),
          bsDate: "",
          adDate: "",
          date: initialData.date ?? "",
        });
      } else {
        setFormData(emptyForm);
      }
      setErrors({});
    }, 0);
    return () => clearTimeout(id);
  }, [initialData, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFormData(emptyForm);
      setErrors({});
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const base = {
      productID: formData.productID,
      quantity: Number(formData.quantity),
      rate: Number(formData.rate),
      note: formData.note || undefined,
      invoiceNo: formData.invoiceNo || undefined,
    };

    if (isEdit) {
      const validateFields = updateStockInSchema.safeParse({
        ...base,
        date: formData.date,
      });
      if (!validateFields.success) {
        setIsSubmitting(false);
        const fieldErrors = validateFields.error.flatten().fieldErrors;
        setErrors({
          note: fieldErrors.note?.[0],
          quantity: fieldErrors.quantity?.[0],
          productID: fieldErrors.productID?.[0],
          rate: fieldErrors.rate?.[0],
          invoiceNo: fieldErrors.invoiceNo?.[0],
          date: fieldErrors.date?.[0],
        });
        return;
      }
      try {
        await onSubmit({ ...validateFields.data, quantity: base.quantity });
        setFormData(emptyForm);
        setErrors({});
        onClose();
      } catch (err) {
        const error = err as BackendError;
        toast.error(error?.message ?? "Something went wrong");
        if (error?.errors?.length) {
          setErrors(mapFieldErrors(error));
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const validateFields = createStockInSchema.safeParse({
      ...base,
      supplierID: formData.supplierID,
      bsDate: formData.bsDate,
      date: formData.adDate,
    });
    if (!validateFields.success) {
      setIsSubmitting(false);
      const fieldErrors = validateFields.error.flatten().fieldErrors;
      setErrors({
        note: fieldErrors.note?.[0],
        quantity: fieldErrors.quantity?.[0],
        productID: fieldErrors.productID?.[0],
        rate: fieldErrors.rate?.[0],
        invoiceNo: fieldErrors.invoiceNo?.[0],
        date: fieldErrors.date?.[0],
        bsDate: fieldErrors.bsDate?.[0],
        supplierID: fieldErrors.supplierID?.[0],
      });
      return;
    }

    try {
      await onSubmit({
        ...validateFields.data,
        quantity: base.quantity,
      });
      setFormData(emptyForm);
      setErrors({});
      onClose();
    } catch (err) {
      const error = err as BackendError;
      toast.error(error?.message ?? "Something went wrong");
      if (error?.errors?.length) {
        setErrors(mapFieldErrors(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = useMemo(() => {
    if (!products || !formData.productID) return undefined;
    return products.find((p) => p.id === formData.productID);
  }, [products, formData.productID]);

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === formData.supplierID),
    [suppliers, formData.supplierID],
  );

  const selectTriggerClass = inventorySelectTriggerClass;

  return (
    <AdminDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "Edit Stock In" : "Add Stock In"}
      description={
        isEdit
          ? "Update an existing stock-in record"
          : "Record incoming inventory and link it to a supplier"
      }
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            className={adminSecondaryButtonClass}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="stock-in-form"
            disabled={isSubmitting}
            className={adminPrimaryButtonClass}
          >
            {isSubmitting ? <Spinner /> : isEdit ? "Update" : "Add"}
          </button>
        </div>
      }
    >
      <form
        id="stock-in-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-10 px-8 py-10"
      >
        <InventoryFormSection title="Item details">
          <InventoryFormField label="Product" required error={errors?.productID}>
            {products.length === 0 ? (
              <p className="text-xs text-[rgba(47,78,64,0.55)]">
                No products found. Please{" "}
                <Link
                  href="/admin/inventory/products"
                  className="text-(--brand-brown) underline-offset-2 hover:underline"
                >
                  create a product
                </Link>{" "}
                first.
              </p>
            ) : (
              <Select
                value={formData.productID}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, productID: v ?? "" }))
                }
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select product">
                    {selectedProduct?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-none border border-[rgba(47,78,64,0.18)] bg-white">
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </InventoryFormField>

          {!isEdit ? (
            <InventoryFormField
              label="Supplier"
              required
              error={errors?.supplierID}
            >
              <Select
                value={formData.supplierID}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, supplierID: v ?? "" }))
                }
                disabled={suppliersLoading}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue
                    placeholder={
                      suppliersLoading
                        ? "Loading suppliers…"
                        : "Select supplier"
                    }
                  >
                    {selectedSupplier?.companyName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-none border border-[rgba(47,78,64,0.18)] bg-white">
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InventoryFormField>
          ) : null}

          <InventoryFormField
            label="Date (BS)"
            required
            error={errors?.bsDate ?? errors?.date}
          >
            {isEdit ? (
              <input
                placeholder="2081-01-15"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className={fieldInputClass}
              />
            ) : (
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]"
                  strokeWidth={1.75}
                />
                <NepaliDatePicker
                  inputClassName={cn(inputCls, "rounded-none pl-9")}
                  value={formData.bsDate}
                  onChange={(v: string) => {
                    try {
                      setFormData((prev) => ({
                        ...prev,
                        bsDate: v,
                        adDate: BSToAD(v),
                      }));
                    } catch (err) {
                      toast.error(
                        err instanceof Error ? err.message : "Invalid date",
                      );
                    }
                  }}
                  options={{ calenderLocale: "en", valueLocale: "en" }}
                />
              </div>
            )}
          </InventoryFormField>
        </InventoryFormSection>

        <InventoryFormSection title="Quantity & pricing">
          <div className="grid grid-cols-2 gap-4">
            <InventoryFormField label="Qty" required error={errors?.quantity}>
              <input
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
                className={fieldInputClass}
              />
            </InventoryFormField>
            <InventoryFormField
              label="Rate (Rs.)"
              required
              error={errors?.rate}
            >
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={formData.rate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rate: e.target.value }))
                }
                className={fieldInputClass}
              />
            </InventoryFormField>
          </div>

          <InventoryFormField label="Invoice No" optional>
            <input
              placeholder="INV-001"
              value={formData.invoiceNo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, invoiceNo: e.target.value }))
              }
              className={fieldInputClass}
            />
          </InventoryFormField>
        </InventoryFormSection>

        <InventoryFormSection title="Additional">
          <InventoryFormField label="Note" optional>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              rows={3}
              className={cn(fieldInputClass, "resize-none")}
              placeholder="Optional note…"
            />
          </InventoryFormField>
        </InventoryFormSection>
      </form>
    </AdminDrawer>
  );
}
