"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form-nextjs";
import { AxiosError } from "axios";
import {
  APIError,
  ProductCategory,
  ProductCategoryInput,
  productCategoryInputSchema,
} from "@repo/types";

import { AdminDrawer } from "@/components/admin/admin-drawer";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { mapFieldErrors } from "@/utils/api";
import { cn } from "@/lib/utils";
import {
  InventoryFormField,
  InventoryFormSection,
  inventoryFieldInputClass,
} from "../shared/InventoryFormField";
import { SearchableSelect } from "../shared/SearchableSelect";
import {
  buildTreeOptions,
  getPathLabel,
  getSubtreeIds,
  ROOT_OPTION_VALUE,
} from "@/components/admin/hierarchy/tree";

const ROOT_LABEL = "None (top-level category)";

// The parent remounts this dialog (via `key`) each time it opens, so the form
// and any server errors always start from the target's current values.
type CategoryFormDialogProps = {
  open: boolean;
  /** The category being edited; null when creating. */
  category: ProductCategory | null;
  /** Parent to preselect when creating (e.g. "Add sub-category"); "" for top level. */
  defaultParentId: string;
  categories: ProductCategory[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (input: ProductCategoryInput) => Promise<void>;
};

function toFormValues(
  category: ProductCategory | null,
  defaultParentId: string,
): ProductCategoryInput {
  return {
    name: category?.name ?? "",
    description: category?.description ?? "",
    parentId: category ? (category.parentId ?? "") : defaultParentId,
  };
}

export function CategoryFormDialog({
  open,
  category,
  defaultParentId,
  categories,
  loading,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) {
  const isEdit = category !== null;
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductCategoryInput, string>>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);

  // A server error belongs to the value that caused it; drop it as soon as
  // that field is edited so it doesn't linger next to a corrected value.
  const clearServerError = (key: keyof ProductCategoryInput) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const initialValues = useMemo(
    () => toFormValues(category, defaultParentId),
    [category, defaultParentId],
  );

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: productCategoryInputSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await onSubmit(value);
        onClose();
      } catch (err) {
        const data = (err as AxiosError<APIError>).response?.data;
        if (data?.errors?.length) {
          setErrors(mapFieldErrors(data));
        }
      }
    },
  });

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  const byId = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  // A category can't move under itself or anything beneath it.
  const excluded = useMemo(
    () => (category ? getSubtreeIds(categories, category.id) : undefined),
    [categories, category],
  );

  const searchParents = useCallback(
    async (query: string) =>
      buildTreeOptions(categories, query, {
        exclude: excluded,
        rootLabel: ROOT_LABEL,
      }),
    [categories, excluded],
  );

  return (
    <AdminDrawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      variant="modal"
      title={isEdit ? "Edit Category" : "Add Category"}
      description={
        isEdit
          ? "Rename or move this category."
          : "Create a category, or nest it under an existing one."
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={adminSecondaryButtonClass}
          >
            Cancel
          </button>
          <form.Subscribe selector={(s) => s.values}>
            {(values) => {
              const unchanged =
                isEdit &&
                values.name.trim() === initialValues.name &&
                values.description.trim() === initialValues.description &&
                values.parentId === initialValues.parentId;
              return (
                <button
                  type="button"
                  onClick={() => form.handleSubmit()}
                  disabled={loading || unchanged || !values.name.trim()}
                  className={adminPrimaryButtonClass}
                >
                  {loading
                    ? isEdit
                      ? "Saving…"
                      : "Adding…"
                    : isEdit
                      ? "Save Changes"
                      : "Add Category"}
                </button>
              );
            }}
          </form.Subscribe>
        </div>
      }
    >
      <div className="flex flex-col gap-8 px-8 py-10">
        <InventoryFormSection title="Category details">
          <form.Field name="parentId">
            {(field) => {
              const mergedError =
                field.state.meta.errors[0]?.message ?? errors.parentId;
              return (
                <InventoryFormField
                  label="Parent category"
                  optional
                  error={mergedError}
                >
                  <SearchableSelect
                    value={field.state.value || ROOT_OPTION_VALUE}
                    onChange={(value) => {
                      field.handleChange(
                        value === ROOT_OPTION_VALUE ? "" : value,
                      );
                      clearServerError(field.name);
                    }}
                    onSearch={searchParents}
                    selectedLabel={
                      field.state.value
                        ? getPathLabel(byId, field.state.value)
                        : ROOT_LABEL
                    }
                    placeholder="Search categories…"
                    disabled={loading}
                    debounceMs={0}
                  />
                </InventoryFormField>
              );
            }}
          </form.Field>

          <form.Field name="name">
            {(field) => {
              const mergedError =
                field.state.meta.errors[0]?.message ?? errors.name;
              return (
                <InventoryFormField
                  label="Name"
                  htmlFor="category-name"
                  required
                  error={mergedError}
                >
                  <input
                    id="category-name"
                    ref={inputRef}
                    type="text"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearServerError(field.name);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") form.handleSubmit();
                    }}
                    placeholder="e.g. Pants"
                    disabled={loading}
                    className={cn(
                      inventoryFieldInputClass,
                      mergedError && "border-[#9a3412]",
                    )}
                  />
                </InventoryFormField>
              );
            }}
          </form.Field>

          <form.Field name="description">
            {(field) => {
              const mergedError =
                field.state.meta.errors[0]?.message ?? errors.description;
              return (
                <InventoryFormField
                  label="Description"
                  htmlFor="category-description"
                  optional
                  error={mergedError}
                >
                  <textarea
                    id="category-description"
                    rows={3}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearServerError(field.name);
                    }}
                    placeholder="What belongs in this category…"
                    disabled={loading}
                    className={cn(
                      inventoryFieldInputClass,
                      "resize-none",
                      mergedError && "border-[#9a3412]",
                    )}
                  />
                </InventoryFormField>
              );
            }}
          </form.Field>
        </InventoryFormSection>
      </div>
    </AdminDrawer>
  );
}
