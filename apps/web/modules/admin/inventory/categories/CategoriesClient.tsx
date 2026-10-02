"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { ProductCategory, ProductCategoryInput } from "@repo/types";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  useAdminClearFiltersShortcut,
  useAdminEscapeShortcut,
  useAdminFocusSearchShortcut,
  useAdminNewShortcut,
  useAdminRefreshShortcut,
} from "@/components/admin/admin-shortcut-provider";
import { useAdminQueryRefresh } from "@/hooks/useAdminQueryRefresh";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { useProductCategories } from "@/hooks/queries/admin/product_categories/useProductCategories";
import { useCreateProductCategory } from "@/hooks/mutations/admin/product_categories/useCreateProductCategory";
import { useUpdateProductCategory } from "@/hooks/mutations/admin/product_categories/useUpdateProductCategory";
import { useDeleteProductCategory } from "@/hooks/mutations/admin/product_categories/useDeleteProductCategory";
import {
  HierarchyTable,
  type HierarchyColumn,
} from "@/components/admin/hierarchy/HierarchyTable";
import { HierarchyToolbar } from "@/components/admin/hierarchy/HierarchyToolbar";
import {
  HierarchyError,
  HierarchySkeleton,
} from "@/components/admin/hierarchy/HierarchyStates";
import { useHierarchyView } from "@/components/admin/hierarchy/useHierarchyView";

import { inventoryTableWrapClass } from "../shared/inventory-styles";
import { EmptyState } from "../shared/EmptyState";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { CategoryFormDialog } from "./CategoryFormDialog";

const NO_CATEGORIES: ProductCategory[] = [];

type FormTarget = { category: ProductCategory | null; parentId: string };

export function CategoriesClient() {
  // The target is kept after closing so the dialog doesn't flip from
  // "Edit" to "Add" while its close animation plays.
  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<FormTarget>({
    category: null,
    parentId: "",
  });
  const [formKey, setFormKey] = useState(0);
  const [deleteCategory, setDeleteCategory] = useState<ProductCategory | null>(
    null,
  );
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, isPending, isError, error, refetch } = useProductCategories();
  const categories = data ?? NO_CATEGORIES;
  const view = useHierarchyView(categories);
  const { setSearch } = view;

  const createCategory = useCreateProductCategory();
  const updateCategory = useUpdateProductCategory();
  const removeCategory = useDeleteProductCategory();

  const openForm = useCallback((target: FormTarget) => {
    setFormTarget(target);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }, []);

  const toggleCreate = useCallback(() => {
    if (formOpen) setFormOpen(false);
    else openForm({ category: null, parentId: "" });
  }, [formOpen, openForm]);

  useAdminNewShortcut(toggleCreate);
  useAdminRefreshShortcut(useAdminQueryRefresh(refetch));
  useAdminFocusSearchShortcut(
    useCallback(() => searchRef.current?.focus(), []),
  );
  useAdminClearFiltersShortcut(useCallback(() => setSearch(""), [setSearch]));
  useAdminEscapeShortcut(
    useCallback(() => {
      if (formOpen) setFormOpen(false);
      else if (deleteCategory) setDeleteCategory(null);
    }, [formOpen, deleteCategory]),
  );

  const columns = useMemo<HierarchyColumn<ProductCategory>[]>(
    () => [
      {
        header: "Products",
        render: (category) => (
          <span className="tabular-nums text-[rgba(47,78,64,0.7)]">
            {category.productCount}
          </span>
        ),
      },
    ],
    [],
  );

  const handleSubmit = async (input: ProductCategoryInput) => {
    if (formTarget.category) {
      await updateCategory.mutateAsync({
        categoryID: formTarget.category.id,
        data: input,
      });
    } else {
      await createCategory.mutateAsync(input);
    }
    // Make sure the category just added or moved is visible under its parent.
    if (input.parentId) view.expand(input.parentId);
  };

  return (
    <AdminPageLayout
      title="Categories"
      description="Group products into categories. Categories can be nested to any depth."
      maxWidth="wide"
      action={
        <button
          type="button"
          onClick={() => openForm({ category: null, parentId: "" })}
          className={adminPrimaryButtonClass}
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Category
        </button>
      }
    >
      <HierarchyToolbar
        id="product-category-search"
        search={view.search}
        onSearchChange={setSearch}
        searchRef={searchRef}
        placeholder="Search categories…"
        label="Name or description"
        onExpandAll={view.expandAll}
        onCollapseAll={view.collapseAll}
      />

      <div className="min-h-80">
        {isPending ? (
          <HierarchySkeleton />
        ) : isError ? (
          <div className={inventoryTableWrapClass}>
            <HierarchyError
              title="Failed to load categories"
              message={error?.response?.data.message ?? "Something went wrong"}
              onRetry={refetch}
            />
          </div>
        ) : categories.length === 0 ? (
          <div className={inventoryTableWrapClass}>
            <EmptyState message="No categories yet. Add the first one to start organising products." />
          </div>
        ) : view.rows.length === 0 ? (
          <div className={inventoryTableWrapClass}>
            <EmptyState
              message={`No categories match “${view.search.trim()}”.`}
            />
          </div>
        ) : (
          <HierarchyTable
            rows={view.rows}
            collapsed={view.collapsed}
            searching={view.searching}
            onToggle={view.toggle}
            showCode={false}
            columns={columns}
            canManage
            childNoun="sub-category"
            onAddChild={(category) =>
              openForm({ category: null, parentId: category.id })
            }
            onEdit={(category) => openForm({ category, parentId: "" })}
            onDelete={setDeleteCategory}
          />
        )}
      </div>

      <CategoryFormDialog
        key={formKey}
        open={formOpen}
        category={formTarget.category}
        defaultParentId={formTarget.parentId}
        categories={categories}
        loading={createCategory.isPending || updateCategory.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={!!deleteCategory}
        itemName={deleteCategory?.name ?? "category"}
        isLoading={removeCategory.isPending}
        onCancel={() => setDeleteCategory(null)}
        onConfirm={async () => {
          if (!deleteCategory) return;
          try {
            await removeCategory.mutateAsync(deleteCategory.id);
          } catch {
            // The mutation already toasts why (e.g. it still has products
            // or sub-categories); retrying won't help, so just close.
          }
          setDeleteCategory(null);
        }}
      />
    </AdminPageLayout>
  );
}
