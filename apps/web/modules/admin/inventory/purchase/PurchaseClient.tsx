"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PurchaseDialog } from "./PurchaseDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { PurchaseTable } from "./PurchaseTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateStockInBatchInput,
  CreateStockInBatchResponse,
  DeleteStockInResponse,
  ListStockInResponse,
  UpdateStockInInput,
  UpdateStockInResponse,
} from "@repo/types";
import api from "@/lib/axios";
import PurchaseLoading from "./PurchaseLoadingSkeleton";
import PurchaseError from "./PurchaseError";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "../../analytics/hooks/useDebounce";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { AdminExportMenu } from "@/components/admin/admin-export-menu";
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

type Purchase = Extract<
  ListStockInResponse,
  { success: true }
>["data"][number];

export function PurchaseClient() {
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
  const [editTarget, setEditTarget] = useState<Purchase | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Purchase | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: [
      "admin-inventory-purchase",
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
        `/admin/inventory/purchase?${params.toString()}`,
      );
      return res.data;
    },
    staleTime: 10 * 1000 * 60,
    gcTime: 20 * 60 * 1000,
  });

  const createPurchase = useMutation({
    mutationFn: async (data: CreateStockInBatchInput) => {
      try {
        const res = await api.post<CreateStockInBatchResponse>(
          `/admin/inventory/purchase`,
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
        queryKey: ["admin-inventory-purchase", currentPage],
      });
    },
  });
  const updatePurchase = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateStockInInput & { id: string }) => {
      try {
        const res = await api.put<UpdateStockInResponse>(
          `/admin/inventory/purchase/${id}`,
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
        queryKey: ["admin-inventory-purchase", currentPage],
      });
    },
  });
  const deletePurchase = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<DeleteStockInResponse>(
        `/admin/inventory/purchase/${id}`,
      );
      if (!res.data.success) throw res.data;
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: ["admin-inventory-purchase", currentPage],
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

  const handleCreate = async (data: CreateStockInBatchInput) => {
    await createPurchase.mutateAsync(data);
  };

  const handleUpdate = async (data: UpdateStockInInput & { id: string }) => {
    await updatePurchase.mutateAsync(data);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deletePurchase.mutate(deleteTarget.id);
    setDeleteTarget(null);
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
      else if (dialogOpen) setDialogOpen(false);
    }, [deleteTarget, dialogOpen]),
  );

  return (
    <AdminPageLayout
      title="Purchase"
      description="Track all incoming inventory and purchase records."
      maxWidth="wide"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <AdminExportMenu
            path="/admin/inventory/purchase/export"
            filters={{
              search: debouncedSearch.trim(),
              from: dateFrom,
              to: dateTo,
              sort_by_rate: priceSort,
            }}
          />
          <button
            type="button"
            onClick={() => {
              openCreate();
            }}
            className={adminPrimaryButtonClass}
          >
            <Plus size={16} />
            Add Purchase
          </button>
        </div>
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

      {isPending ? (
        <PurchaseLoading />
      ) : isError || !data ? (
        <PurchaseError
          error={{ message: error?.message ?? "Failed to load data" }}
          reset={refetch}
        />
      ) : !data?.success ? (
        <PurchaseError
          error={{
            message: data.message ?? "Failed to process request",
          }}
          reset={refetch}
        />
      ) : (
        <PurchaseTable
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

      <PurchaseDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
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
