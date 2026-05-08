"use client";

import { useState } from "react";
import { toast } from "sonner";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { StockOutTable } from "./StockOutTable";
import { StockOutDialog } from "./StockOutDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  CreateStockOutResponse,
  DeleteStockOutResponse,
  EditStockOutResponse,
  GetProductResponse,
  ListStockOutResponse,
} from "@repo/types";
import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import StockOutLoading from "./StockOutLoading";
import StockOutError from "./StockOutError";
import axios from "axios";

type StockOut = Extract<
  ListStockOutResponse,
  { success: true }
>["data"][number];
type StockOutFormData = Omit<
  StockOut,
  "id" | "createdAt" | "productName" | "productUnit" | "updatedAt" | "qty"
> & {
  quantity: number;
};
export function StockOutClient() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StockOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockOut | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: ["admin-inventory-stock-out", currentPage],
    queryFn: async () => {
      const res = await api.get<ListStockOutResponse>(
        `/admin/inventory/stock/out?page=${currentPage}`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { data: productsData, isPending: productsPending } = useQuery({
    queryKey: ["admin-inventory-stock-in"],
    queryFn: async () => {
      const res = await api.get<GetProductResponse>(
        `/admin/inventory/products`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const createStockOut = useMutation({
    mutationFn: async (data: StockOutFormData) => {
      try {
        const res = await api.post<CreateStockOutResponse>(
          `/admin/inventory/stock/out`,
          data,
        );
        if (!res.data.success) throw res.data;
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err)) throw err.response?.data;
        throw err;
      }
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: ["admin-inventory-stock-out", currentPage],
      });
    },
  });
  const updateStockOut = useMutation({
    mutationFn: async ({ id, ...data }: StockOutFormData & { id: string }) => {
      try {
        const res = await api.put<EditStockOutResponse>(
          `/admin/inventory/stock/out/${id}`,
          data,
        );
        if (!res.data.success) throw res.data;
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err)) throw err.response?.data;
        throw err;
      }
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: ["admin-inventory-stock-out", currentPage],
      });
    },
  });
  const deleteStockOut = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<DeleteStockOutResponse>(
        `/admin/inventory/stock/out/${id}`,
      );
      if (!res.data.success) throw res.data;
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: ["admin-inventory-stock-out", currentPage],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isPending || !data || productsPending || !productsData)
    return <StockOutLoading />;
  if (isError) return <StockOutError error={error} reset={refetch} />;
  if (!data.success || !productsData.success)
    return (
      <StockOutError
        error={{ ...data, message: "Failed to process request" }}
        reset={refetch}
      />
    );

  const records = data.data;
  const limit = data.meta.limit;
  const total = data.meta.total;
  const totalPages = data.meta.totalPages;

  const handleSubmit = async (data: StockOutFormData) => {
    if (editTarget) {
      await updateStockOut.mutateAsync({ id: editTarget.id, ...data });
      setEditTarget(null);
    } else {
      await createStockOut.mutateAsync(data);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteStockOut.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleClose = () => {
    setDialogOpen(false);

    setTimeout(() => setEditTarget(null), 200);
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
        data={records}
        limit={limit}
        total={total}
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
        products={productsData.data}
        stockOut={records}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialData={editTarget}
      />
      {deleteTarget && (
        <ConfirmDialog
          open
          itemName={`${deleteTarget.productName} on ${deleteTarget.date}`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
