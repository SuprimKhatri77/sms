"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { SaleTable } from "./SaleTable";
import { SaleDialog } from "./SaleDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { useDebounce } from "@/modules/admin/analytics/hooks/useDebounce";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  useAdminEscapeShortcut,
  useAdminClearFiltersShortcut,
  useAdminFocusSearchShortcut,
  useAdminNewShortcut,
  useAdminRefreshShortcut,
} from "@/components/admin/admin-shortcut-provider";
import { useAdminQueryRefresh } from "@/hooks/useAdminQueryRefresh";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { InventoryTransactionFilters } from "../shared/InventoryTransactionFilters";
import {
  CreateStockOutBatchInput,
  CreateStockOutBatchResponse,
  DeleteStockOutResponse,
  EditStockOutInput,
  EditStockOutResponse,
  ListStockOutResponse,
} from "@repo/types";
import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SaleLoading from "./SaleLoading";
import SaleError from "./SaleError";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Sale = Extract<ListStockOutResponse, { success: true }>["data"][number];

export function SaleClient() {
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
  const [editTarget, setEditTarget] = useState<Sale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
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

  const handleClear = useCallback(() => {
    setSearch("");
    setPendingFrom("");
    setPendingTo("");
    setDateFrom("");
    setDateTo("");
    setPriceSort("");
    setCurrentPage(1);
    router.push(pathname);
  }, [pathname, router]);

  const hasActiveFilters = !!search || !!dateFrom || !!dateTo || !!priceSort;
  const hasPendingDateChange = pendingFrom !== dateFrom || pendingTo !== dateTo;

  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: [
      "admin-inventory-sale",
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
        `/admin/inventory/sales?${params.toString()}`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const createSale = useMutation({
    mutationFn: async (data: CreateStockOutBatchInput) => {
      try {
        const res = await api.post<CreateStockOutBatchResponse>(
          `/admin/inventory/sales`,
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
        queryKey: ["admin-inventory-sale", currentPage],
      });
    },
  });

  const updateSale = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: EditStockOutInput & { id: string }) => {
      try {
        const res = await api.put<EditStockOutResponse>(
          `/admin/inventory/sales/${id}`,
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
        queryKey: ["admin-inventory-sale", currentPage],
      });
    },
  });

  const deleteSale = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<DeleteStockOutResponse>(
        `/admin/inventory/sales/${id}`,
      );
      if (!res.data.success) throw res.data;
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: ["admin-inventory-sale", currentPage],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = async (data: CreateStockOutBatchInput) => {
    await createSale.mutateAsync(data);
  };

  const handleUpdate = async (data: EditStockOutInput & { id: string }) => {
    await updateSale.mutateAsync(data);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSale.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setTimeout(() => setEditTarget(null), 200);
  };

  const openCreate = useCallback(() => {
    setEditTarget(null);
    setDialogOpen(true);
  }, []);

  const toggleCreate = useCallback(() => {
    if (dialogOpen && !editTarget) setDialogOpen(false);
    else if (!dialogOpen) openCreate();
  }, [dialogOpen, editTarget, openCreate]);

  const focusSearch = useCallback(() => {
    document.getElementById("inventory-tx-search")?.focus();
  }, []);

  useAdminNewShortcut(toggleCreate);
  useAdminFocusSearchShortcut(focusSearch);
  useAdminRefreshShortcut(useAdminQueryRefresh(refetch));
  useAdminClearFiltersShortcut(handleClear);
  useAdminEscapeShortcut(
    useCallback(() => {
      if (deleteTarget) setDeleteTarget(null);
      else if (dialogOpen) handleClose();
    }, [deleteTarget, dialogOpen, handleClose]),
  );

  return (
    <AdminPageLayout
      title="Sales"
      description="Record outgoing inventory and sales."
      maxWidth="wide"
      action={
        <button
          type="button"
          onClick={openCreate}
          className={adminPrimaryButtonClass}
        >
          <Plus size={16} />
          Add Sale
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

      {isPending ? (
        <SaleLoading />
      ) : isError || !data ? (
        <SaleError
          error={{ message: error?.message ?? "Failed to load data" }}
          reset={refetch}
        />
      ) : !data.success ? (
        <SaleError
          error={{
            message: data.message ?? "Failed to process request",
          }}
          reset={refetch}
        />
      ) : (
        <SaleTable
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

      <SaleDialog
        open={dialogOpen}
        onClose={handleClose}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
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
