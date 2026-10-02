"use client";

import { useForm } from "@tanstack/react-form-nextjs";
import { UnitCombobox } from "./UnitComboBox";
import {
  type CreateProductInput,
  CreateProductResponse,
  createProductSchema,
  GetProductResponse,
} from "@repo/types/inventory";
import { toast } from "sonner";
import { useCallback, useMemo, useState } from "react";
import type { ProductCategory } from "@repo/types";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  InventoryFormField,
  inventoryFieldInputClass,
} from "../shared/InventoryFormField";
import { SearchableSelect } from "../shared/SearchableSelect";
import {
  buildTreeOptions,
  getPathLabel,
  ROOT_OPTION_VALUE,
} from "@/components/admin/hierarchy/tree";

const NO_CATEGORY_LABEL = "No category";

type Product = Extract<GetProductResponse, { success: true }>["data"][number];
type BackendError = Extract<CreateProductResponse, { success: false }>;

type ProductDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateProductInput) => Promise<void>;
  editingProduct?: Product | null;
  categories: ProductCategory[];
};
type ProductFields = keyof CreateProductInput;

export function ProductDialog({
  open,
  onClose,
  onSubmit,
  editingProduct,
  categories,
}: ProductDialogProps) {
  const [backendErrors, setBackendErrors] = useState<
    Partial<Record<ProductFields, string>>
  >({});

  const form = useForm({
    defaultValues: {
      name: editingProduct?.name ?? "",
      unit: editingProduct?.unit ?? "pieces",
      categoryId: editingProduct?.categoryId ?? "",
    },
    validators: {
      onSubmit: createProductSchema,
    },
    onSubmitInvalid: ({ formApi }) => {
      formApi.validate("submit");
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await onSubmit(value);
        formApi.reset();
        onClose();
      } catch (err) {
        const error = err as BackendError;
        toast.error(error?.message ?? "Something went wrong");
        if (error?.errors?.length) {
          const mapped: Partial<Record<ProductFields, string>> = {};
          for (const fieldErr of error.errors) {
            mapped[fieldErr.field as ProductFields] = fieldErr.message;
          }
          setBackendErrors(mapped);
        }
      }
    },
  });

  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );
  const searchCategories = useCallback(
    async (query: string) =>
      buildTreeOptions(categories, query, { rootLabel: NO_CATEGORY_LABEL }),
    [categories],
  );

  const handleClose = () => {
    form.reset();
    setBackendErrors({});
    onClose();
  };

  const isEdit = !!editingProduct;

  return (
    <AdminDrawer
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
      variant="modal"
      title={isEdit ? "Edit Product" : "New Product"}
      description="Add or update a product in your catalogue"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={form.state.isSubmitting}
            className={adminSecondaryButtonClass}
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={form.state.isSubmitting || !form.state.canSubmit}
            className={adminPrimaryButtonClass}
          >
            {form.state.isSubmitting ? (
              <Spinner />
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      }
    >
      <form
        id="product-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-8 px-8 py-10"
      >
        <form.Field name="name">
          {(field) => {
            const mergedError =
              field.state.meta.errors[0]?.message ?? backendErrors.name;
            return (
              <InventoryFormField
                label="Product Name"
                required
                error={mergedError}
              >
                <input
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setBackendErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  onBlur={field.handleBlur}
                  placeholder="e.g. All-purpose flour"
                  className={cn(
                    inventoryFieldInputClass,
                    mergedError && "border-[#9a3412]",
                  )}
                />
              </InventoryFormField>
            );
          }}
        </form.Field>

        <form.Field name="unit">
          {(field) => {
            const mergedError =
              field.state.meta.errors[0]?.message ?? backendErrors.unit;
            return (
              <InventoryFormField label="Unit" required error={mergedError}>
                <UnitCombobox
                  value={field.state.value}
                  onChange={(v) => {
                    field.handleChange(v);
                    setBackendErrors((prev) => ({ ...prev, unit: undefined }));
                  }}
                  onBlur={field.handleBlur}
                />
              </InventoryFormField>
            );
          }}
        </form.Field>

        <form.Field name="categoryId">
          {(field) => {
            const mergedError =
              field.state.meta.errors[0]?.message ?? backendErrors.categoryId;
            return (
              <InventoryFormField label="Category" optional error={mergedError}>
                <SearchableSelect
                  value={field.state.value || ROOT_OPTION_VALUE}
                  onChange={(value) => {
                    field.handleChange(
                      value === ROOT_OPTION_VALUE ? "" : value,
                    );
                    setBackendErrors((prev) => ({
                      ...prev,
                      categoryId: undefined,
                    }));
                  }}
                  onSearch={searchCategories}
                  selectedLabel={
                    field.state.value
                      ? getPathLabel(categoriesById, field.state.value)
                      : NO_CATEGORY_LABEL
                  }
                  placeholder="Search categories…"
                  debounceMs={0}
                />
              </InventoryFormField>
            );
          }}
        </form.Field>
      </form>
    </AdminDrawer>
  );
}
