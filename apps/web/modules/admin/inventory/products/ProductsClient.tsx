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

import { paginate } from "../lib/utils";
import { EmptyState } from "../shared/EmptyState";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateProductInput,
  CreateProductResponse,
  DeleteProductResponse,
  GetProductResponse,
  UpdateProductResponse,
} from "@repo/types";
import ProductsLoading from "./ProductsLoading";
import { ProductsError } from "./ProductsError";
import api from "@/lib/axios";
import axios from "axios";

type Product = Extract<GetProductResponse, { success: true }>["data"][number];

export function ProductsClient() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: ["admin-inventory-products", page],
    queryFn: async () => {
      const res = await api.get<GetProductResponse>(
        `/admin/inventory/products?page=${page}`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const createProduct = useMutation({
    mutationFn: async (data: CreateProductInput) => {
      try {
        const res = await api.post<CreateProductResponse>(
          "/admin/inventory/products",
          data,
        );
        if (!res.data.success) throw res.data;
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err)) throw err.response?.data;
        throw err;
      }
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ["admin-inventory-products", page],
      });
      const previousProducts = queryClient.getQueryData<GetProductResponse>([
        "admin-inventory-products",
      ]);
      const optimisticProduct = {
        id: crypto.randomUUID(),
        name: data.name,
        unit: data.unit,
        createdAt: new Date(),
      };

      queryClient.setQueryData<GetProductResponse>(
        ["admin-inventory-products"],
        (old) => {
          if (!old || !old.success) return old;
          return {
            ...old,
            data: [...old.data, optimisticProduct],
          };
        },
      );

      return { previousProducts, optimisticProduct };
    },
    onSuccess: (result, _, context) => {
      toast.success(result.message);
      queryClient.setQueryData<GetProductResponse>(
        ["admin-inventory-products", page],
        (old) => {
          if (!old || !old.success) return old;
          return {
            ...old,
            data: old.data.map((p) =>
              p.id === context.optimisticProduct.id ? { ...result.data } : p,
            ),
          };
        },
      );
    },
    onError: (error, _, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          ["admin-inventory-products", page],
          context.previousProducts,
        );
      }
      toast.error(error.message ?? "Something went wrong");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-products"] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: CreateProductInput & { id: string }) => {
      try {
        const res = await api.put<UpdateProductResponse>(
          `/admin/inventory/products/${id}`,
          data,
        );
        if (!res.data.success) throw res.data;
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err)) throw err.response?.data;
        throw err;
      }
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ["admin-inventory-products", page],
      });
      const previousProducts = queryClient.getQueryData<GetProductResponse>([
        "admin-inventory-products",
      ]);
      const optimisticProduct = {
        id: data.id,
        name: data.name,
        unit: data.unit,
        createdAt: editingProduct?.createdAt ?? new Date(),
      };

      queryClient.setQueryData<GetProductResponse>(
        ["admin-inventory-products"],
        (old) => {
          if (!old || !old.success) return old;
          return {
            ...old,
            data: old.data.map((p) =>
              p.id === optimisticProduct.id ? { ...optimisticProduct } : p,
            ),
          };
        },
      );

      return { previousProducts };
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error, _, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          ["admin-inventory-products", page],
          context.previousProducts,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-products"] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<DeleteProductResponse>(
        `/admin/inventory/products/${id}`,
      );
      if (!res.data.success) throw res.data;
      return res.data;
    },
    onMutate: async (id: string) => {
      setDeletingProduct(null);
      await queryClient.cancelQueries({
        queryKey: ["admin-inventory-products", page],
      });
      const previousProducts = queryClient.getQueryData([
        "admin-inventory-products",
      ]);

      queryClient.setQueryData<GetProductResponse>(
        ["admin-inventory-products", page],
        (old) => {
          if (!old || !old.success) return old;
          return {
            ...old,
            data: old.data.filter((p) => p.id !== id),
          };
        },
      );
      return { previousProducts };
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setIsDeleting(false);
    },
    onError: (__, _, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          ["admin-inventory-products", page],
          context.previousProducts,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-products"] });
    },
  });
  if (isPending) return <ProductsLoading />;
  if (isError) return <ProductsError error={error} reset={refetch} />;
  if (!data || !data.success)
    return <ProductsError error={data} reset={refetch} />;

  const products = data.data;

  const pageSize = data.meta.limit;
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

  const handleSubmit = async (values: CreateProductInput) => {
    if (editingProduct) {
      await updateProduct.mutateAsync({ ...values, id: editingProduct.id });
    } else {
      await createProduct.mutateAsync(values);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    await deleteProduct.mutateAsync(deletingProduct.id);
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
            meta={{
              total: data.meta.total,
              totalPages: data.meta.totalPages,
              limit: data.meta.limit,
            }}
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
