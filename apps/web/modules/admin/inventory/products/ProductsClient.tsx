"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Pagination } from "../shared/Pagination";
import { ProductsTable } from "./ProductsTable";
import { ProductDialog } from "./ProductDialog";

import { mockProducts } from "../lib/mock-data";
import { generateId, paginate, DEFAULT_PAGE_SIZE } from "../lib/utils";
import type { Product, ProductFormValues } from "../types";
import { EmptyState } from "../shared/EmptyState";

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = DEFAULT_PAGE_SIZE;
  const paginated = paginate(products, page, pageSize);

  const handleCreate = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleSubmit = async (values: ProductFormValues) => {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 500));

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...values } : p)),
      );
      toast.success(`"${values.name}" updated successfully.`);
    } else {
      const newProduct: Product = {
        id: generateId("prod"),
        name: values.name,
        unit: values.unit,
        created_at: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      toast.success(`"${values.name}" created successfully.`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    await new Promise((r) => setTimeout(r, 500));
    setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    toast.success(`"${deletingProduct.name}" deleted.`);
    setIsDeleting(false);
    setDeletingProduct(null);
    // Reset to page 1 if current page is now empty
    if (paginated.length === 1 && page > 1) setPage(page - 1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <InventoryPageHeader
        title="Products"
        description="Manage your product catalogue — add, edit, or remove products."
        action={
          <Button
            onClick={handleCreate}
            className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white gap-2"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      {products.length === 0 ? (
        <EmptyState message="No products yet. Create your first product to get started." />
      ) : (
        <>
          <ProductsTable
            products={paginated}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <Pagination
            page={page}
            meta={{ total: 0, totalPages: 0, limit: 20 }}
            onPageChange={setPage}
          />
        </>
      )}

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
      />

      <ConfirmDialog
        open={!!deletingProduct}
        itemName={deletingProduct?.name ?? ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
