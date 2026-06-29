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
  CreateWastageInput,
  CreateWastageResponse,
  createWastageSchema,
  GetProductResponse,
  ListWastageResponse,
} from "@repo/types";
import { useEffect, useMemo, useState } from "react";
import { mapFieldErrors } from "@/utils/api";
import { toast } from "sonner";

type Wastage = Extract<ListWastageResponse, { success: true }>["data"][number];
type BackendError = Extract<CreateWastageResponse, { success: false }>;
type WastageFormData = Omit<
  Wastage,
  "id" | "createdAt" | "productName" | "productUnit" | "updatedAt" | "qty"
> & {
  quantity: number;
};
type Product = Extract<GetProductResponse, { success: true }>["data"][number];

type Props = {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onSubmit: (data: WastageFormData) => Promise<void> | void;
  initialData?: Wastage | null;
};

const fieldInputClass = inventoryFieldInputClass;

const EMPTY_FORM = {
  reason: "",
  productID: "",
  quantity: "1",
  rate: "",
  date: "",
};

export function WastageDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  products,
}: Props) {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] =
    useState<Partial<Record<keyof CreateWastageInput, string>>>();

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      if (initialData) {
        setFormData({
          reason: initialData.reason ?? "",
          productID: initialData.productID ?? "",
          quantity: initialData.qty.toString(),
          rate: (initialData.rate / 100).toString(),
          date: initialData.date ?? "",
        });
      } else {
        setFormData(EMPTY_FORM);
      }
      setErrors({});
    }, 0);
    return () => clearTimeout(id);
  }, [initialData, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFormData(EMPTY_FORM);
      setErrors({});
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: CreateWastageInput = {
      ...formData,
      quantity: Number(formData.quantity),
      rate: Number(formData.rate),
      reason: formData.reason || undefined,
    };

    const validateFields = createWastageSchema.safeParse(payload);
    if (!validateFields.success) {
      setIsSubmitting(false);
      const fieldErrors = validateFields.error.flatten().fieldErrors;
      setErrors({
        reason: fieldErrors.reason?.[0],
        quantity: fieldErrors.quantity?.[0],
        productID: fieldErrors.productID?.[0],
        rate: fieldErrors.rate?.[0],
        date: fieldErrors.date?.[0],
      });
      return;
    }

    try {
      await onSubmit({ ...validateFields.data, quantity: payload.quantity });
      setFormData(EMPTY_FORM);
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
    if (!formData.productID) return undefined;
    return products.find((p) => p.id === formData.productID);
  }, [products, formData.productID]);

  const selectTriggerClass = inventorySelectTriggerClass;

  return (
    <AdminDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "Edit Wastage" : "Log Wastage"}
      description={
        isEdit ? "Update a wastage record" : "Record damaged or lost inventory"
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
            form="wastage-form"
            disabled={isSubmitting}
            className={adminPrimaryButtonClass}
          >
            {isSubmitting ? <Spinner /> : isEdit ? "Update" : "Log Wastage"}
          </button>
        </div>
      }
    >
      <form
        id="wastage-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-10 px-8 py-10"
      >
        <InventoryFormSection title="Item details">
          <InventoryFormField label="Product" required error={errors?.productID}>
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
          </InventoryFormField>

          <InventoryFormField label="Date (BS)" required error={errors?.date}>
            <div className="relative">
              <CalendarDays
                className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]"
                strokeWidth={1.75}
              />
              <NepaliDatePicker
                inputClassName={cn(inputCls, "rounded-none pl-9")}
                value={formData.date}
                onChange={(v: string) =>
                  setFormData((prev) => ({ ...prev, date: v }))
                }
                options={{ calenderLocale: "en", valueLocale: "en" }}
              />
            </div>
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
            <InventoryFormField label="Rate (Rs.)" required error={errors?.rate}>
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
        </InventoryFormSection>

        <InventoryFormSection title="Additional">
          <InventoryFormField label="Reason" optional>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows={3}
              className={cn(fieldInputClass, "resize-none")}
              placeholder="e.g. Damaged in transit…"
            />
          </InventoryFormField>
        </InventoryFormSection>
      </form>
    </AdminDrawer>
  );
}
