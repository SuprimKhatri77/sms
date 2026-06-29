"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Plus, Search } from "lucide-react";
import { useDebounce } from "@/modules/admin/analytics/hooks/useDebounce";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { inputCls } from "../../students/detail/shared/utils";
import { cn } from "@/lib/utils";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  adminInputClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-styles";
import { InventoryFilterShell } from "../shared/InventoryFilterShell";
import { inventoryLabelClass, inventoryTableWrapClass } from "../shared/inventory-styles";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BSToAD } from "bikram-sambat-js";

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
  const debouncedSearch = useDebounce(search, 400);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  useEffect(() => {
    updateParams({ search: debouncedSearch.trim() });
  }, [debouncedSearch]);

  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: [
      "admin-inventory-products",
      page,
      debouncedSearch.trim(),
      dateFrom,
      dateTo,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      const trimmedSearch = debouncedSearch.trim();
      if (trimmedSearch) params.set("name", trimmedSearch);
      if (dateFrom) params.set("from", BSToAD(dateFrom));
      if (dateTo) params.set("to", BSToAD(dateTo));
      const res = await api.get<GetProductResponse>(
        `/admin/inventory/products?${params.toString()}`,
      );
      return res.data;
    },
    staleTime: 10 * 1000 * 60,
    gcTime: 20 * 60 * 1000,
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
        page,
      ]);
      const optimisticProduct = {
        id: crypto.randomUUID(),
        name: data.name,
        unit: data.unit,
        createdAt: new Date(),
      };

      queryClient.setQueryData<GetProductResponse>(
        ["admin-inventory-products", page],
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
        page,
      ]);
      const optimisticProduct = {
        id: data.id,
        name: data.name,
        unit: data.unit,
        createdAt: editingProduct?.createdAt ?? new Date(),
      };

      queryClient.setQueryData<GetProductResponse>(
        ["admin-inventory-products", page],
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
    if (value.startsWith(" ")) return;
    setSearch(value);
    setPage(1);
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

  const hasActiveFilters = !!search || !!dateFrom || !!dateTo;
  const hasPendingDateChange = pendingFrom !== dateFrom || pendingTo !== dateTo;
  return (
    <AdminPageLayout
      title="Products"
      description="Manage your product catalogue — add, edit, or remove products."
      maxWidth="wide"
      action={
        <button type="button" onClick={handleCreate} className={adminPrimaryButtonClass}>
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      }
    >
      <InventoryFilterShell
        hasActiveFilters={hasActiveFilters}
        onClear={handleClear}
      >
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-1.5 md:col-span-5">
            <label className={inventoryLabelClass} htmlFor="product-search">
              Name
            </label>
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]" />
              <input
                id="product-search"
                placeholder="Search by product name…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={cn(adminInputClass, "rounded-none pl-9 normal-case tracking-normal")}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5 md:col-span-7">
            <span className={inventoryLabelClass}>Created date range (BS)</span>
            <div className="flex w-full flex-wrap items-center gap-2">
              <div className="relative min-w-[9rem] flex-1">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]" strokeWidth={1.75} />
                <NepaliDatePicker
                  inputClassName={cn(inputCls, "rounded-none pl-9")}
                  value={pendingFrom}
                  onChange={(v: string) => setPendingFrom(v)}
                  options={{ calenderLocale: "en", valueLocale: "en" }}
                />
              </div>
              <span className="shrink-0 text-sm text-[rgba(47,78,64,0.45)]">to</span>
              <div className="relative min-w-[9rem] flex-1">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]" strokeWidth={1.75} />
                <NepaliDatePicker
                  inputClassName={cn(inputCls, "rounded-none pl-9")}
                  value={pendingTo}
                  onChange={(v: string) => setPendingTo(v)}
                  options={{ calenderLocale: "en", valueLocale: "en" }}
                />
              </div>
              {hasPendingDateChange ? (
                <button type="button" onClick={handleApplyDates} className={adminPrimaryButtonClass}>
                  Apply dates
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </InventoryFilterShell>

      {isPending ? (
        <ProductsLoading />
      ) : isError || !data ? (
        <ProductsError error={error} reset={refetch} />
      ) : !data.success ? (
        <ProductsError error={data} reset={refetch} />
      ) : data.data.length === 0 && !hasActiveFilters ? (
        <div className={inventoryTableWrapClass}>
          <EmptyState message="No products yet. Create your first product to get started." />
        </div>
      ) : data.data.length === 0 && hasActiveFilters ? (
        <div className={inventoryTableWrapClass}>
          <EmptyState message="No products match your current filters." />
        </div>
      ) : (
        <>
          <ProductsTable
            products={data.data}
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
    </AdminPageLayout>
  );
}
