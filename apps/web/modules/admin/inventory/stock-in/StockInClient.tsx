"use client";

import { useState } from "react";
import { toast } from "sonner";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { StockInDialog } from "./StockInDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StockInTable } from "./StockInTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateStockInResponse,
  DeleteStockInResponse,
  ListStockInResponse,
} from "@repo/types";
import api from "@/lib/axios";
import StockInLoading from "./StockInLoadingSkeleton";
import StockInError from "./StockInError";
import axios from "axios";

type StockIn = Extract<ListStockInResponse, { success: true }>["data"][number];
type StockInFormData = Omit<
  StockIn,
  "id" | "createdAt" | "productName" | "productUnit" | "updatedAt" | "qty"
> & {
  quantity: number;
};

export function StockInClient() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StockIn | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockIn | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: ["admin-inventory-stock-in", currentPage],
    queryFn: async () => {
      const res = await api.get<ListStockInResponse>(
        `/admin/inventory/stock/in?page=${currentPage}`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const createStockIn = useMutation({
    mutationFn: async (data: StockInFormData) => {
      try {
        const res = await api.post<CreateStockInResponse>(
          `/admin/inventory/stock/in`,
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
        queryKey: ["admin-inventory-stock-in", currentPage],
      });
    },
  });
  const updateStockIn = useMutation({
    mutationFn: async ({ id, ...data }: StockInFormData & { id: string }) => {
      try {
        const res = await api.put<CreateStockInResponse>(
          `/admin/inventory/stock/in/${id}`,
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
        queryKey: ["admin-inventory-stock-in", currentPage],
      });
    },
  });
  const deleteStockIn = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<DeleteStockInResponse>(
        `/admin/inventory/stock/in/${id}`,
      );
      if (!res.data.success) throw res.data;
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: ["admin-inventory-stock-in", currentPage],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isPending) return <StockInLoading />;
  if (isError) return <StockInError error={error} reset={refetch} />;
  if (!data || !data.success)
    return <StockInError error={data} reset={refetch} />;

  const records = data.data;
  const limit = data.meta.limit;
  const total = data.meta.total;
  const totalPages = data.meta.totalPages;

  const handleSubmit = async (data: StockInFormData) => {
    if (editTarget) {
      updateStockIn.mutateAsync({ ...data, id: editTarget.id });
      setEditTarget(null);
    } else {
      await createStockIn.mutateAsync(data);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteStockIn.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 min-h-screen bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <InventoryPageHeader
        title="Stock In"
        description="Track all incoming inventory and purchase records."
        action={
          <Button
            onClick={() => {
              setEditTarget(null);
              setDialogOpen(true);
            }}
            className="bg-(--brand-green) hover:bg-(--brand-green-2) text-white font-(--font-dm-sans) gap-2"
          >
            <Plus size={16} /> Add Stock In
          </Button>
        }
      />

      <StockInTable
        data={records}
        total={total}
        limit={limit}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={(item) => {
          setDialogOpen(true);
          setEditTarget(item);
        }}
        onDelete={setDeleteTarget}
      />

      <StockInDialog
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
          itemName={`${deleteTarget.productName} on ${deleteTarget.date}`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
