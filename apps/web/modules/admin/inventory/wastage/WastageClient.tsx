"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/modules/admin/analytics/hooks/useDebounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { WastageTable } from "./WastageTable";
import { WastageDialog } from "./WastageDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { InventoryTransactionFilters } from "../shared/InventoryTransactionFilters";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Wastage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Wastage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );
  const debouncedSearch = useDebounce(searchInput, 400);
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") ?? "");
  const [pendingFrom, setPendingFrom] = useState(
    searchParams.get("from") ?? "",
  );
  const [pendingTo, setPendingTo] = useState(searchParams.get("to") ?? "");
  // const [createdSort, setCreatedSort] = useState<"asc" | "desc" | "">(
  //   (searchParams.get("sort") as "asc" | "desc") ?? "",
  // );
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | "">(
    (searchParams.get("sort_by_rate") as "asc" | "desc") ?? "",
  );

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

  const handleSearchInputChange = (value: string) => {
    if (value !== " " && !value.startsWith(" ")) {
      setSearchInput(value);
      setCurrentPage(1);
    }
  };

  const handleApplyDates = () => {
    setDateFrom(pendingFrom);
    setDateTo(pendingTo);
    updateParams({ from: pendingFrom, to: pendingTo });
    setCurrentPage(1);
  };

  const handlePriceSort = (value: "asc" | "desc" | "") => {
    setPriceSort(value);
    updateParams({ priceSort: value });
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearchInput("");
    setPendingFrom("");
    setPendingTo("");
    setDateFrom("");
    setDateTo("");
    setPriceSort("");
    // setCreatedSort("");
    setCurrentPage(1);
    router.push(pathname);
  };

  const hasActiveFilters =
    !!debouncedSearch || !!dateFrom || !!dateTo || !!priceSort;
  const hasPendingDateChange = pendingFrom !== dateFrom || pendingTo !== dateTo;

  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: [
      "admin-inventory-wastage",
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
      if (trimmedSearch) params.set("product_name", trimmedSearch);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (priceSort) params.set("sort_by_rate", priceSort);
      const res = await api.get<ListWastageResponse>(
        `/admin/inventory/wastages?${params.toString()}`,
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
    <AdminPageLayout
      title="Wastage"
      description="Track damaged, expired, or lost inventory."
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
          Log Wastage
        </button>
      }
    >
      <InventoryTransactionFilters
        search={searchInput}
        onSearchChange={handleSearchInputChange}
        searchPlaceholder="Product name…"
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
        <WastageLoading />
      ) : isError ? (
        <WastageError error={error} reset={refetch} />
      ) : !data.success || !productsData?.success ? (
        <WastageError
          error={{ ...data, message: "Failed to process request" }}
          reset={refetch}
        />
      ) : (
        <WastageTable
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

      <WastageDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        onSubmit={handleSubmit}
        initialData={editTarget}
        products={productsData?.success ? productsData.data : []}
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
