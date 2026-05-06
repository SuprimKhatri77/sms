"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { StockOutTable } from "./StockOutTable";
import { StockOutDialog } from "./StockOutDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockStockOut, mockProducts } from "../lib/mock-data";
import { paginate, DEFAULT_PAGE_SIZE } from "../lib/utils";
import type { StockOut } from "../types";

export function StockOutClient() {
  const [records, setRecords] = useState<StockOut[]>(mockStockOut);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StockOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockOut | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(records.length / DEFAULT_PAGE_SIZE);
  const pageData = useMemo(
    () => paginate(records, currentPage),
    [records, currentPage],
  );

  const handleSubmit = async (
    data: Omit<StockOut, "id" | "created_at" | "product_name" | "product_unit">,
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
      toast.success("Stock-out record updated");
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
      toast.success("Stock-out record added");
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
        title="Stock Out"
        description="Record outgoing inventory and sales."
        action={
          <Button
            onClick={() => {
              setEditTarget(null);
              setDialogOpen(true);
            }}
            className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white font-[var(--font-dm-sans)] gap-2"
          >
            <Plus size={16} /> Add Stock Out
          </Button>
        }
      />
      <StockOutTable
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
      <StockOutDialog
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
