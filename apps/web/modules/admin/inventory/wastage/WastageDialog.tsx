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
import { SearchableSelect } from "../shared/SearchableSelect";
import {
  LineItemsEditor,
  emptyLineItem,
  type LineItemRow,
  type LineItemErrors,
} from "../shared/LineItemsEditor";
import { useProductSearch } from "../shared/useProductSupplierSearch";
import {
  CreateWastageBatchInput,
  CreateWastageBatchResponse,
  EditWastageInput,
  EditWastageResponse,
  createWastageBatchSchema,
  editWastageSchema,
  ListWastageResponse,
} from "@repo/types";
import { useEffect, useState } from "react";
import { mapFieldErrors } from "@/utils/api";
import { toast } from "sonner";

type Wastage = Extract<ListWastageResponse, { success: true }>["data"][number];
type BatchBackendError = Extract<
  CreateWastageBatchResponse,
  { success: false }
>;
type EditBackendError = Extract<EditWastageResponse, { success: false }>;

type EditFormData = {
  reason: string;
  productID: string;
  quantity: string;
  rate: string;
  date: string;
};

type HeaderFormData = {
  reason: string;
  date: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateWastageBatchInput) => Promise<void>;
  onUpdate: (data: EditWastageInput & { id: string }) => Promise<void>;
  initialData?: Wastage | null;
};

const fieldInputClass = inventoryFieldInputClass;

const emptyEditForm: EditFormData = {
  reason: "",
  productID: "",
  quantity: "1",
  rate: "",
  date: "",
};

const emptyHeader: HeaderFormData = { reason: "", date: "" };

export function WastageDialog({
  open,
  onClose,
  onCreate,
  onUpdate,
  initialData,
}: Props) {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editErrors, setEditErrors] =
    useState<Partial<Record<keyof EditFormData, string>>>();
  const [selectedProductName, setSelectedProductName] = useState("");

  const [header, setHeader] = useState(emptyHeader);
  const [headerErrors, setHeaderErrors] =
    useState<Partial<Record<keyof HeaderFormData, string>>>();
  const [items, setItems] = useState<LineItemRow[]>([emptyLineItem()]);
  const [itemErrors, setItemErrors] = useState<LineItemErrors>();

  const searchProducts = useProductSearch();

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      if (initialData) {
        setEditForm({
          reason: initialData.reason ?? "",
          productID: initialData.productID ?? "",
          quantity: initialData.qty.toString(),
          rate: (initialData.rate / 100).toString(),
          date: initialData.date ?? "",
        });
        setSelectedProductName(initialData.productName ?? "");
      } else {
        setHeader(emptyHeader);
        setItems([emptyLineItem()]);
      }
      setEditErrors({});
      setHeaderErrors({});
      setItemErrors({});
    }, 0);
    return () => clearTimeout(id);
  }, [initialData, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEditForm(emptyEditForm);
      setHeader(emptyHeader);
      setItems([emptyLineItem()]);
      setEditErrors({});
      setHeaderErrors({});
      setItemErrors({});
      onClose();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData) return;
    setIsSubmitting(true);

    const validateFields = editWastageSchema.safeParse({
      productID: editForm.productID,
      quantity: Number(editForm.quantity),
      rate: Number(editForm.rate),
      reason: editForm.reason || undefined,
      date: editForm.date,
    });
    if (!validateFields.success) {
      setIsSubmitting(false);
      const fieldErrors = validateFields.error.flatten().fieldErrors;
      setEditErrors({
        reason: fieldErrors.reason?.[0],
        quantity: fieldErrors.quantity?.[0],
        productID: fieldErrors.productID?.[0],
        rate: fieldErrors.rate?.[0],
        date: fieldErrors.date?.[0],
      });
      return;
    }

    try {
      await onUpdate({ ...validateFields.data, id: initialData.id });
      onClose();
    } catch (err) {
      const error = err as EditBackendError;
      toast.error(error?.message ?? "Something went wrong");
      if (error?.errors?.length) {
        setEditErrors(mapFieldErrors(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      date: header.date,
      reason: header.reason || undefined,
      items: items.map((item) => ({
        productID: item.productID,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
    };

    const validateFields = createWastageBatchSchema.safeParse(payload);
    if (!validateFields.success) {
      setIsSubmitting(false);
      const fieldErrors = validateFields.error.flatten().fieldErrors;
      setHeaderErrors({
        date: fieldErrors.date?.[0],
        reason: fieldErrors.reason?.[0],
      });

      const nextItemErrors: LineItemErrors = {};
      for (const issue of validateFields.error.issues) {
        if (issue.path[0] === "items" && typeof issue.path[1] === "number") {
          const key = items[issue.path[1]]?.key;
          const field = issue.path[2] as
            | "productID"
            | "quantity"
            | "rate"
            | undefined;
          if (key && field) {
            nextItemErrors[key] = {
              ...nextItemErrors[key],
              [field]: issue.message,
            };
          }
        }
      }
      setItemErrors(nextItemErrors);
      return;
    }

    try {
      await onCreate(validateFields.data);
      setHeader(emptyHeader);
      setItems([emptyLineItem()]);
      setHeaderErrors({});
      setItemErrors({});
      onClose();
    } catch (err) {
      const error = err as BatchBackendError;
      toast.error(error?.message ?? "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminDrawer
      open={open}
      onOpenChange={handleOpenChange}
      variant="modal"
      className={isEdit ? undefined : "sm:max-w-xl"}
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
      {isEdit ? (
        <form
          id="wastage-form"
          onSubmit={handleEditSubmit}
          className="flex flex-col gap-10 px-8 py-10"
        >
          <InventoryFormSection title="Item details">
            <InventoryFormField
              label="Product"
              required
              error={editErrors?.productID}
            >
              <SearchableSelect
                value={editForm.productID}
                onChange={(v, label) => {
                  setEditForm((prev) => ({ ...prev, productID: v }));
                  setSelectedProductName(label);
                }}
                onSearch={searchProducts}
                placeholder="Search product…"
                selectedLabel={selectedProductName}
              />
            </InventoryFormField>

            <InventoryFormField
              label="Date (BS)"
              required
              error={editErrors?.date}
            >
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]"
                  strokeWidth={1.75}
                />
                <NepaliDatePicker
                  inputClassName={cn(inputCls, "rounded-none pl-9")}
                  value={editForm.date}
                  onChange={(v: string) =>
                    setEditForm((prev) => ({ ...prev, date: v }))
                  }
                  options={{ calenderLocale: "en", valueLocale: "en" }}
                />
              </div>
            </InventoryFormField>
          </InventoryFormSection>

          <InventoryFormSection title="Quantity & pricing">
            <div className="grid grid-cols-2 gap-4">
              <InventoryFormField
                label="Qty"
                required
                error={editErrors?.quantity}
              >
                <input
                  type="number"
                  min={1}
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  className={fieldInputClass}
                />
              </InventoryFormField>
              <InventoryFormField
                label="Rate (Rs.)"
                required
                error={editErrors?.rate}
              >
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={editForm.rate}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, rate: e.target.value }))
                  }
                  className={fieldInputClass}
                />
              </InventoryFormField>
            </div>
          </InventoryFormSection>

          <InventoryFormSection title="Additional">
            <InventoryFormField label="Reason" optional>
              <textarea
                value={editForm.reason}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={3}
                className={cn(fieldInputClass, "resize-none")}
                placeholder="e.g. Damaged in transit…"
              />
            </InventoryFormField>
          </InventoryFormSection>
        </form>
      ) : (
        <form
          id="wastage-form"
          onSubmit={handleCreateSubmit}
          className="flex flex-col gap-10 px-8 py-10"
        >
          <InventoryFormSection title="Batch details">
            <InventoryFormField
              label="Date (BS)"
              required
              error={headerErrors?.date}
            >
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]"
                  strokeWidth={1.75}
                />
                <NepaliDatePicker
                  inputClassName={cn(inputCls, "rounded-none pl-9")}
                  value={header.date}
                  onChange={(v: string) =>
                    setHeader((prev) => ({ ...prev, date: v }))
                  }
                  options={{ calenderLocale: "en", valueLocale: "en" }}
                />
              </div>
            </InventoryFormField>

            <InventoryFormField label="Reason" optional>
              <textarea
                value={header.reason}
                onChange={(e) =>
                  setHeader((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={2}
                className={cn(fieldInputClass, "resize-none")}
                placeholder="e.g. Damaged in transit…"
              />
            </InventoryFormField>
          </InventoryFormSection>

          <InventoryFormSection title="Items">
            <LineItemsEditor
              items={items}
              onChange={setItems}
              onSearchProducts={searchProducts}
              errors={itemErrors}
            />
          </InventoryFormSection>
        </form>
      )}
    </AdminDrawer>
  );
}
