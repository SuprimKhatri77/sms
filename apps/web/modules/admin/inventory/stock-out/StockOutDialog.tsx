"use client";

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
} from "../shared/InventoryFormField";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "../shared/SearchableSelect";
import {
  CreateStockOutInput,
  CreateStockOutResponse,
  createStockOutSchema,
  GetProductResponse,
  ListStockOutResponse,
} from "@repo/types";
import { useCallback, useEffect, useState } from "react";
import { mapFieldErrors } from "@/utils/api";
import { toast } from "sonner";
import api from "@/lib/axios";

type StockOut = Extract<
  ListStockOutResponse,
  { success: true }
>["data"][number];
type BackendError = Extract<CreateStockOutResponse, { success: false }>;
type StockOutFormData = Omit<
  StockOut,
  "id" | "createdAt" | "productName" | "productUnit" | "updatedAt" | "qty"
> & {
  quantity: number;
};
type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StockOutFormData) => Promise<void> | void;
  initialData?: StockOut | null;
  stockOut?: StockOut[];
};

const fieldInputClass = inventoryFieldInputClass;

const EMPTY_FORM = {
  billNo: "",
  note: "",
  productID: "",
  quantity: "1",
  rate: "",
  date: "",
};

export function StockOutDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] =
    useState<Partial<Record<keyof CreateStockOutInput, string>>>();
  const [selectedProductName, setSelectedProductName] = useState("");

  const searchProducts = useCallback(
    async (q: string): Promise<SearchableSelectOption[]> => {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "10");
      if (q) params.set("name", q);
      const res = await api.get<GetProductResponse>(
        `/admin/inventory/products?${params.toString()}`,
      );
      if (!res.data.success) return [];
      return res.data.data.map((p) => ({ value: p.id, label: p.name }));
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      if (initialData) {
        setFormData({
          billNo: initialData.billNo ?? "",
          note: initialData.note ?? "",
          productID: initialData.productID ?? "",
          quantity: initialData.qty.toString(),
          rate: (initialData.rate / 100).toString(),
          date: initialData.date ?? "",
        });
        setSelectedProductName(initialData.productName ?? "");
      } else {
        setFormData(EMPTY_FORM);
        setSelectedProductName("");
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

    const payload: CreateStockOutInput = {
      ...formData,
      quantity: Number(formData.quantity),
      rate: Number(formData.rate),
      note: formData.note || undefined,
      billNo: formData.billNo || undefined,
    };

    const validateFields = createStockOutSchema.safeParse(payload);
    if (!validateFields.success) {
      setIsSubmitting(false);
      const fieldErrors = validateFields.error.flatten().fieldErrors;
      setErrors({
        note: fieldErrors.note?.[0],
        quantity: fieldErrors.quantity?.[0],
        productID: fieldErrors.productID?.[0],
        rate: fieldErrors.rate?.[0],
        billNo: fieldErrors.billNo?.[0],
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

  return (
    <AdminDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "Edit Stock Out" : "Add Stock Out"}
      description={
        isEdit
          ? "Update an existing stock-out record"
          : "Record inventory issued or sold"
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
            form="stock-out-form"
            disabled={isSubmitting}
            className={adminPrimaryButtonClass}
          >
            {isSubmitting ? <Spinner /> : isEdit ? "Update" : "Add"}
          </button>
        </div>
      }
    >
      <form
        id="stock-out-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-10 px-8 py-10"
      >
        <InventoryFormSection title="Item details">
          <InventoryFormField label="Product" required error={errors?.productID}>
            <SearchableSelect
              value={formData.productID}
              onChange={(v, label) => {
                setFormData((prev) => ({ ...prev, productID: v }));
                setSelectedProductName(label);
              }}
              onSearch={searchProducts}
              placeholder="Search product…"
              selectedLabel={selectedProductName}
            />
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

          <InventoryFormField label="Bill No" optional>
            <input
              placeholder="BILL-001"
              value={formData.billNo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, billNo: e.target.value }))
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
