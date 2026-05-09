"use client";

import { useState } from "react";
import { toast } from "sonner";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { WastageTable } from "./WastageTable";
import { WastageDialog } from "./WastageDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  CreateWastageInput,
  CreateWastageResponse,
  DeleteWastageResponse,
  EditWastageResponse,
  GetProductResponse,
  ListWastageResponse,
} from "@repo/types/inventory";
import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import WastageLoading from "./WastageLoading";
import WastageError from "./WastageError";
import axios from "axios";

type Wastage = Extract<ListWastageResponse, { success: true }>["data"][number];
type WastageFormData = Omit<
  Wastage,
  "id" | "createdAt" | "productName" | "productUnit" | "updatedAt" | "qty"
> & {
  quantity: number;
};

export function WastageClient() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Wastage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Wastage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: ["admin-inventory-wastage", currentPage],
    queryFn: async () => {
      const res = await api.get<ListWastageResponse>(
        `/admin/inventory/wastages?page=${currentPage}`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { data: productsData, isPending: productsPending } = useQuery({
    queryKey: ["admin-inventory-products"],
    queryFn: async () => {
      const res = await api.get<GetProductResponse>(
        `/admin/inventory/products`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const createWastage = useMutation({
    mutationFn: async (data: CreateWastageInput) => {
      try {
        const res = await api.post<CreateWastageResponse>(
          `/admin/inventory/wastages`,
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
        queryKey: ["admin-inventory-wastage", currentPage],
      });
    },
  });
  const updateWastage = useMutation({
    mutationFn: async ({ id, ...data }: WastageFormData & { id: string }) => {
      try {
        const res = await api.put<EditWastageResponse>(
          `/admin/inventory/wastages/${id}`,
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
        queryKey: ["admin-inventory-wastage", currentPage],
      });
    },
  });
  const deleteWastage = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<DeleteWastageResponse>(
        `/admin/inventory/wastages/${id}`,
      );
      if (!res.data.success) throw res.data;
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: ["admin-inventory-wastage", currentPage],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isPending || !data || productsPending || !productsData)
    return <WastageLoading />;
  if (isError) return <WastageError error={error} reset={refetch} />;
  if (!data.success || !productsData.success)
    return (
      <WastageError
        error={{ ...data, message: "Failed to process request" }}
        reset={refetch}
      />
    );

  const records = data.data;
  const limit = data.meta.limit;
  const total = data.meta.total;
  const totalPages = data.meta.totalPages;

  const handleSubmit = async (
    data: Omit<
      Wastage,
      "id" | "createdAt" | "productName" | "productUnit" | "updatedAt" | "qty"
    > & { quantity: number },
  ) => {
    if (editTarget) {
      await updateWastage.mutateAsync({ id: editTarget.id, ...data });
      setEditTarget(null);
    } else {
      await createWastage.mutateAsync(data);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteWastage.mutate(deleteTarget.id);
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
      <WastageDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        onSubmit={handleSubmit}
        initialData={editTarget}
        products={productsData.data}
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
