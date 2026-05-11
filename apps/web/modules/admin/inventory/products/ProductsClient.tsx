"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CalendarIcon, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Pagination } from "../shared/Pagination";
import { ProductsTable } from "./ProductsTable";
import { ProductDialog } from "./ProductDialog";

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
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Product = Extract<GetProductResponse, { success: true }>["data"][number];

export function ProductsClient() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") ?? "");

  const [pendingFrom, setPendingFrom] = useState(
    searchParams.get("from") ?? "",
  );
  const [pendingTo, setPendingTo] = useState(searchParams.get("to") ?? "");
  const queryClient = useQueryClient();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      params.delete("page"); // reset page on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

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
    await deleteProduct.mutate(deletingProduct.id);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateParams({ search: value });
  };

  const handleApplyDates = () => {
    setDateFrom(pendingFrom);
    setDateTo(pendingTo);
    updateParams({ from: pendingFrom, to: pendingTo });
  };

  const handleClear = () => {
    setSearch("");
    setPendingFrom("");
    setPendingTo("");
    setDateFrom("");
    setDateTo("");
    router.push(pathname);
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    const created = p.createdAt ? new Date(p.createdAt) : null;
    const matchesFrom = !dateFrom || (created && created >= new Date(dateFrom));
    const matchesTo =
      !dateTo || (created && created <= new Date(dateTo + "T23:59:59"));
    return matchesSearch && matchesFrom && matchesTo;
  });

  const filteredPaginated = filtered.slice(
    (page - 1) * data.meta.limit,
    page * data.meta.limit,
  );

  const hasActiveFilters = !!search || !!dateFrom || !!dateTo;
  const hasPendingDateChange = pendingFrom !== dateFrom || pendingTo !== dateTo;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-4">
      <InventoryPageHeader
        title="Products"
        description="Manage your product catalogue — add, edit, or remove products."
        action={
          <Button
            onClick={handleCreate}
            className="bg-(--brand-green) hover:bg-(--brand-green-2) text-white gap-2"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-full"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          />
        </div>

        {/* Date range + Apply */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={pendingFrom}
              onChange={(e) => setPendingFrom(e.target.value)}
              className="pl-9 w-36"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>
          <span className="text-muted-foreground text-sm shrink-0">to</span>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={pendingTo}
              onChange={(e) => setPendingTo(e.target.value)}
              className="pl-9 w-36"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>

          {/* Apply — only shows when dates have changed */}
          {hasPendingDateChange && (
            <Button
              size="sm"
              onClick={handleApplyDates}
              className="bg-(--brand-green) hover:bg-(--brand-green-2) text-white shrink-0"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Apply
            </Button>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground gap-1 shrink-0"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Result count when filtering */}
      {hasActiveFilters && (
        <p
          className="text-sm text-muted-foreground"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {filtered.length === 0
            ? "No products match your filters."
            : `Showing ${filtered.length} of ${products.length} product${products.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {products.length === 0 ? (
        <EmptyState message="No products yet. Create your first product to get started." />
      ) : filtered.length === 0 && hasActiveFilters ? (
        <EmptyState message="No products match your current filters." />
      ) : (
        <>
          <ProductsTable
            products={filteredPaginated}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <Pagination
            page={page}
            meta={{
              total: filtered.length,
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
