// modules/admin/inventory/components/wastage/WastageClient.tsx
"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { WastageTable } from "./WastageTable";
import { WastageDialog } from "./WastageDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockWastage, mockProducts } from "../lib/mock-data";
import { paginate, DEFAULT_PAGE_SIZE } from "../lib/utils";
import type { Wastage } from "../types";

export function WastageClient() {
  const [records, setRecords] = useState<Wastage[]>(mockWastage);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Wastage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Wastage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(records.length / DEFAULT_PAGE_SIZE);
  const pageData = useMemo(
    () => paginate(records, currentPage),
    [records, currentPage],
  );

  const handleSubmit = async (
    data: Omit<Wastage, "id" | "created_at" | "product_name" | "product_unit">,
  ) => {
    await new Promise((r) => setTimeout(r, 500));
    const product = mockProducts.find((p) => p.id === data.product_id);
    if (!product) throw new Error("Product not found");

    if (editTarget) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editTarget.id
            ? {
                ...r,
                ...data,
                product_name: product.name,
                product_unit: product.unit,
              }
            : r,
        ),
      );
      toast.success("Wastage record updated");
      setEditTarget(null);
    } else {
      setRecords((prev) => [
        {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          product_name: product.name,
          product_unit: product.unit,
          ...data,
        },
        ...prev,
      ]);
      toast.success("Wastage logged");
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    toast.success("Record deleted");
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 min-h-screen bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <InventoryPageHeader
        title="Wastage"
        description="Track damaged, expired, or lost inventory."
        action={
          <Button
            onClick={() => {
              setEditTarget(null);
              setDialogOpen(true);
            }}
            className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white font-[var(--font-dm-sans)] gap-2"
          >
            <Plus size={16} /> Log Wastage
          </Button>
        }
      />
      <WastageTable
        data={pageData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={(item) => {
          setEditTarget(item);
          setDialogOpen(true);
        }}
        onDelete={setDeleteTarget}
      />
      <WastageDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        onSubmit={handleSubmit}
        initialData={editTarget}
      />
      {deleteTarget && (
        <ConfirmDialog
          open
          itemName={`${deleteTarget.product_name} on ${deleteTarget.date}`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
