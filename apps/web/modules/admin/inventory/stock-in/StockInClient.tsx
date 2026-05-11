"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { StockInDialog } from "./StockInDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, Search, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
    (searchParams.get("sort") as "asc" | "desc") ?? "",
  );

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

  if (isPending || !data || !productsData || productsPending)
    return <StockInLoading />;
  if (isError) return <StockInError error={error} reset={refetch} />;
  if (!data.success || !productsData.success)
    return (
      <StockInError
        error={{
          message: !data.success
            ? data.message
            : !productsData.success
              ? productsData.message
              : "Failed to process request",
        }}
        reset={refetch}
      />
    );

  const records = data.data;
  const limit = data.meta.limit;

  // --- Filter handlers ---
  const handleSearchChange = (value: string) => {
    setSearch(value);
    // swap this for: debouncedSearch(value) → updateParams({ search: value })
    updateParams({ search: value });
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

  const filtered = records
    .filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        r.productName.toLowerCase().includes(q) ||
        r.invoiceNo?.toLowerCase().includes(q);
      const matchesFrom = !dateFrom || r.date >= dateFrom;
      const matchesTo = !dateTo || r.date <= dateTo;
      return matchesSearch && matchesFrom && matchesTo;
    })
    .sort((a, b) => {
      if (!priceSort) return 0;
      return priceSort === "asc" ? a.rate - b.rate : b.rate - a.rate;
    });

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
    <div className="space-y-4 min-h-screen bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8 mx-auto max-w-8xl">
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

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Search + Price sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by product name or invoice no…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>

          <Select
            value={priceSort}
            onValueChange={(v) => handlePriceSort(v as "asc" | "desc" | "")}
          >
            <SelectTrigger
              className="w-full sm:w-44"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <SelectValue placeholder="Sort by rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default</SelectItem>
              <SelectItem value="asc">Rate: Low → High</SelectItem>
              <SelectItem value="desc">Rate: High → Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Date range + Apply + Clear */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={pendingFrom}
              onChange={(e) => setPendingFrom(e.target.value)}
              className="pl-9 w-38"
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
              className="pl-9 w-38"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>

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

          {hasActiveFilters && (
            <p
              className="text-sm text-muted-foreground ml-auto"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {filtered.length} of {records.length} record
              {records.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <StockInTable
        data={filtered}
        total={filtered.length}
        limit={limit}
        currentPage={currentPage}
        totalPages={Math.ceil(filtered.length / limit)}
        onPageChange={setCurrentPage}
        onEdit={(item) => {
          setDialogOpen(true);
          setEditTarget(item);
        }}
        onDelete={setDeleteTarget}
      />

      <StockInDialog
        products={productsData.data}
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
