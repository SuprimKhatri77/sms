"use client";

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
} from "../shared/InventoryFormField";
import { SearchableSelect } from "../shared/SearchableSelect";
import {
  LineItemsEditor,
  emptyLineItem,
  type LineItemRow,
  type LineItemErrors,
} from "../shared/LineItemsEditor";
import { useProductSearch, useSupplierSearch } from "../shared/useProductSupplierSearch";

import {
  CreateStockInBatchInput,
  CreateStockInBatchResponse,
  UpdateStockInInput,
  UpdateStockInResponse,
  createStockInBatchSchema,
  ListStockInResponse,
  updateStockInSchema,
} from "@repo/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { mapFieldErrors } from "@/utils/api";

type Purchase = Extract<
  ListStockInResponse,
  { success: true }
>["data"][number];
type BatchBackendError = Extract<CreateStockInBatchResponse, { success: false }>;
type UpdateBackendError = Extract<UpdateStockInResponse, { success: false }>;

type EditFormData = {
  invoiceNo: string;
  note: string;
  productID: string;
  supplierID: string;
  quantity: string;
  rate: string;
  date: string;
};

type HeaderFormData = {
  invoiceNo: string;
  note: string;
  supplierID: string;
  bsDate: string;
  adDate: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateStockInBatchInput) => Promise<void>;
  onUpdate: (data: UpdateStockInInput & { id: string }) => Promise<void>;
  initialData?: Purchase | null;
};

const fieldInputClass = inventoryFieldInputClass;

const emptyEditForm: EditFormData = {
  invoiceNo: "",
  note: "",
  productID: "",
  supplierID: "",
  quantity: "1",
  rate: "",
  date: "",
};

const emptyHeader: HeaderFormData = {
  invoiceNo: "",
  note: "",
  supplierID: "",
  bsDate: "",
  adDate: "",
};

export function PurchaseDialog({
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
    useState<Partial<Record<keyof HeaderFormData | "date", string>>>();
  const [items, setItems] = useState<LineItemRow[]>([emptyLineItem()]);
  const [itemErrors, setItemErrors] = useState<LineItemErrors>();
  const [selectedSupplierName, setSelectedSupplierName] = useState("");

  const searchProducts = useProductSearch();
  const searchSuppliers = useSupplierSearch();

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      if (initialData) {
        setEditForm({
          invoiceNo: initialData.invoiceNo ?? "",
          note: initialData.note ?? "",
          productID: initialData.productId ?? "",
          supplierID: initialData.supplierId ?? "",
          quantity: initialData.qty.toString(),
          rate: (initialData.rate / 100).toString(),
          date: initialData.date ?? "",
        });
        setSelectedProductName(initialData.productName ?? "");
        setSelectedSupplierName(initialData.supplierName ?? "");
      } else {
        setHeader(emptyHeader);
        setItems([emptyLineItem()]);
        setSelectedSupplierName("");
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

    const validateFields = updateStockInSchema.safeParse({
      productID: editForm.productID,
      supplierID: editForm.supplierID,
      quantity: Number(editForm.quantity),
      rate: Number(editForm.rate),
      note: editForm.note || undefined,
      invoiceNo: editForm.invoiceNo || undefined,
      date: editForm.date,
    });
    if (!validateFields.success) {
      setIsSubmitting(false);
      const fieldErrors = validateFields.error.flatten().fieldErrors;
      setEditErrors({
        note: fieldErrors.note?.[0],
        quantity: fieldErrors.quantity?.[0],
        productID: fieldErrors.productID?.[0],
        supplierID: fieldErrors.supplierID?.[0],
        rate: fieldErrors.rate?.[0],
        invoiceNo: fieldErrors.invoiceNo?.[0],
        date: fieldErrors.date?.[0],
      });
      return;
    }

    try {
      await onUpdate({ ...validateFields.data, id: initialData.id });
      onClose();
    } catch (err) {
      const error = err as UpdateBackendError;
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
      supplierID: header.supplierID,
      date: header.adDate,
      bsDate: header.bsDate,
      note: header.note || undefined,
      invoiceNo: header.invoiceNo || undefined,
      items: items.map((item) => ({
        productID: item.productID,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
    };

    const validateFields = createStockInBatchSchema.safeParse(payload);
    if (!validateFields.success) {
      setIsSubmitting(false);
      const fieldErrors = validateFields.error.flatten().fieldErrors;
      setHeaderErrors({
        supplierID: fieldErrors.supplierID?.[0],
        date: fieldErrors.date?.[0],
        bsDate: fieldErrors.bsDate?.[0],
        note: fieldErrors.note?.[0],
        invoiceNo: fieldErrors.invoiceNo?.[0],
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
      title={isEdit ? "Edit Purchase" : "Add Purchase"}
      description={
        isEdit
          ? "Update an existing purchase record"
          : "Record one bill's worth of incoming inventory, item by item"
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
            form="purchase-form"
            disabled={isSubmitting}
            className={adminPrimaryButtonClass}
          >
            {isSubmitting ? <Spinner /> : isEdit ? "Update" : "Add"}
          </button>
        </div>
      }
    >
      {isEdit ? (
        <form
          id="purchase-form"
          onSubmit={handleEditSubmit}
          className="flex flex-col gap-10 px-8 py-10"
        >
          <InventoryFormSection title="Item details">
            <InventoryFormField
              label="Supplier"
              required
              error={editErrors?.supplierID}
            >
              <SearchableSelect
                value={editForm.supplierID}
                onChange={(v, label) => {
                  setEditForm((prev) => ({ ...prev, supplierID: v }));
                  setSelectedSupplierName(label);
                }}
                onSearch={searchSuppliers}
                placeholder="Search supplier…"
                selectedLabel={selectedSupplierName}
              />
            </InventoryFormField>

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
              <input
                placeholder="2081-01-15"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, date: e.target.value }))
                }
                className={fieldInputClass}
              />
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
                  min={0.001}
                  step={0.001}
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

            <InventoryFormField label="Invoice No" optional>
              <input
                placeholder="INV-001"
                value={editForm.invoiceNo}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    invoiceNo: e.target.value,
                  }))
                }
                className={fieldInputClass}
              />
            </InventoryFormField>
          </InventoryFormSection>

          <InventoryFormSection title="Additional">
            <InventoryFormField label="Note" optional>
              <textarea
                value={editForm.note}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, note: e.target.value }))
                }
                rows={3}
                className={cn(fieldInputClass, "resize-none")}
                placeholder="Optional note…"
              />
            </InventoryFormField>
          </InventoryFormSection>
        </form>
      ) : (
        <form
          id="purchase-form"
          onSubmit={handleCreateSubmit}
          className="flex flex-col gap-10 px-8 py-10"
        >
          <InventoryFormSection title="Bill details">
            <InventoryFormField
              label="Supplier"
              required
              error={headerErrors?.supplierID}
            >
              <SearchableSelect
                value={header.supplierID}
                onChange={(v, label) => {
                  setHeader((prev) => ({ ...prev, supplierID: v }));
                  setSelectedSupplierName(label);
                }}
                onSearch={searchSuppliers}
                placeholder="Search supplier…"
                selectedLabel={selectedSupplierName}
              />
            </InventoryFormField>

            <InventoryFormField
              label="Date (BS)"
              required
              error={headerErrors?.bsDate ?? headerErrors?.date}
            >
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]"
                  strokeWidth={1.75}
                />
                <NepaliDatePicker
                  inputClassName={cn(inputCls, "rounded-none pl-9")}
                  value={header.bsDate}
                  onChange={(v: string) => {
                    try {
                      setHeader((prev) => ({
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
            </InventoryFormField>

            <InventoryFormField label="Invoice No" optional>
              <input
                placeholder="INV-001"
                value={header.invoiceNo}
                onChange={(e) =>
                  setHeader((prev) => ({ ...prev, invoiceNo: e.target.value }))
                }
                className={fieldInputClass}
              />
            </InventoryFormField>

            <InventoryFormField label="Note" optional>
              <textarea
                value={header.note}
                onChange={(e) =>
                  setHeader((prev) => ({ ...prev, note: e.target.value }))
                }
                rows={2}
                className={cn(fieldInputClass, "resize-none")}
                placeholder="Optional note…"
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
