"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { StockOutTable } from "./StockOutTable";
import { StockOutDialog } from "./StockOutDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { useDebounce } from "@/modules/admin/analytics/hooks/useDebounce";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { InventoryTransactionFilters } from "../shared/InventoryTransactionFilters";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
    (searchParams.get("sort") as "asc" | "desc") ?? "",
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StockOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockOut | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const handleSearchChange = (value: string) => {
    if (value.startsWith(" ")) return;
    setSearch(value);
    setCurrentPage(1);
  };

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

  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: [
      "admin-inventory-stock-out",
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
      const res = await api.get<ListStockOutResponse>(
        `/admin/inventory/stock/out?${params.toString()}`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { data: productsData, isPending: productsPending } = useQuery({
    queryKey: ["admin-inventory-stock-out-products"],
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
    <AdminPageLayout
      title="Stock Out"
      description="Record outgoing inventory and sales."
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
          Add Stock Out
        </button>
      }
    >
      <InventoryTransactionFilters
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Product name or bill no…"
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
        <StockOutLoading />
      ) : isError || !data || !productsData ? (
        <StockOutError
          error={{ message: error?.message ?? "Failed to load data" }}
          reset={refetch}
        />
      ) : !data.success || !productsData.success ? (
        <StockOutError
          error={{
            message: !data.success
              ? data.message
              : !productsData.success
                ? productsData.message
                : "Failed to process request",
          }}
          reset={refetch}
        />
      ) : (
        <StockOutTable
          data={data.data}
          limit={data.meta.limit}
          total={data.meta.total}
          currentPage={currentPage}
          totalPages={data.meta.totalPages}
          onPageChange={setCurrentPage}
          onEdit={(item) => {
            setEditTarget(item);
            setDialogOpen(true);
          }}
          onDelete={setDeleteTarget}
        />
      )}

      <StockOutDialog
        open={dialogOpen}
        products={productsData?.success ? productsData.data : []}
        stockOut={data?.success ? data.data : []}
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
    </AdminPageLayout>
  );
}
