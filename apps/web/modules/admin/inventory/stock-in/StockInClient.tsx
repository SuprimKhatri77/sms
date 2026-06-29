"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { StockInDialog } from "./StockInDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { StockInTable } from "./StockInTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateStockInResponse,
  DeleteStockInResponse,
  GetProductResponse,
  ListStockInResponse,
} from "@repo/types";
import api from "@/lib/axios";
import StockInLoading from "./StockInLoadingSkeleton";
import StockInError from "./StockInError";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "../../analytics/hooks/useDebounce";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { InventoryTransactionFilters } from "../shared/InventoryTransactionFilters";

type StockIn = Extract<ListStockInResponse, { success: true }>["data"][number];
type StockInFormData = Omit<
  StockIn,
  "id" | "createdAt" | "productName" | "productUnit" | "updatedAt" | "qty"
> & {
  quantity: number;
};

export function StockInClient() {
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
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | "">(
    (searchParams.get("sort_by_rate") as "asc" | "desc") ?? "",
  );
  const debouncedSearch = useDebounce(search, 400);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StockIn | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockIn | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: [
      "admin-inventory-stock-in",
      currentPage,
      debouncedSearch.trim(),
      dateFrom,
      dateTo,
      priceSort,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      const trimmedSearch = debouncedSearch.trim();
      if (trimmedSearch) params.set("search", trimmedSearch);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (priceSort) params.set("sort_by_rate", priceSort);
      const res = await api.get<ListStockInResponse>(
        `/admin/inventory/stock/in?${params.toString()}`,
      );
      return res.data;
    },
    staleTime: 10 * 1000 * 60,
    gcTime: 20 * 60 * 1000,
  });

  const { data: productsData, isPending: productsPending } = useQuery({
    queryKey: ["admin-inventory-stock-in-products"],
    queryFn: async () => {
      const res = await api.get<GetProductResponse>(
        `/admin/inventory/products`,
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

  const handleApplyDates = () => {
    setDateFrom(pendingFrom);
    setDateTo(pendingTo);
    updateParams({ from: pendingFrom, to: pendingTo });
    setCurrentPage(1);
  };

  const handlePriceSort = (value: "asc" | "desc" | "") => {
    setPriceSort(value);
    updateParams({ sort: value });
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearch("");
    setPendingFrom("");
    setPendingTo("");
    setDateFrom("");
    setDateTo("");
    setPriceSort("");
    setCurrentPage(1);
    router.push(pathname);
  };

  const hasActiveFilters = !!search || !!dateFrom || !!dateTo || !!priceSort;
  const hasPendingDateChange = pendingFrom !== dateFrom || pendingTo !== dateTo;

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
    <AdminPageLayout
      title="Stock In"
      description="Track all incoming inventory and purchase records."
      maxWidth="wide"
      action={
        <button
          type="button"
          onClick={() => {
            setEditTarget(null);
            setDialogOpen(true);
          }}
          className={adminPrimaryButtonClass}
        >
          <Plus size={16} />
          Add Stock In
        </button>
      }
    >
      <InventoryTransactionFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setCurrentPage(1);
        }}
        searchPlaceholder="Product name or invoice no…"
        priceSort={priceSort}
        onPriceSortChange={handlePriceSort}
        pendingFrom={pendingFrom}
        pendingTo={pendingTo}
        onPendingFromChange={setPendingFrom}
        onPendingToChange={setPendingTo}
        hasPendingDateChange={hasPendingDateChange}
        onApplyDates={handleApplyDates}
        hasActiveFilters={hasActiveFilters}
        onClear={handleClear}
      />

      {isPending || productsPending ? (
        <StockInLoading />
      ) : isError || !data || !productsData ? (
        <StockInError
          error={{ message: error?.message ?? "Failed to load data" }}
          reset={refetch}
        />
      ) : !data?.success || !productsData?.success ? (
        <StockInError
          error={{
            message: !data?.success
              ? data.message
              : !productsData?.success
                ? productsData.message
                : "Failed to process request",
          }}
          reset={refetch}
        />
      ) : (
        <StockInTable
          data={data.data}
          total={data.meta.total}
          limit={data.meta.limit}
          currentPage={currentPage}
          totalPages={data.meta.totalPages}
          onPageChange={setCurrentPage}
          onEdit={(item) => {
            setDialogOpen(true);
            setEditTarget(item);
          }}
          onDelete={setDeleteTarget}
        />
      )}

      <StockInDialog
        products={productsData?.success ? productsData.data : []}
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
    </AdminPageLayout>
  );
}
