"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { StockOutTable } from "./StockOutTable";
import { StockOutDialog } from "./StockOutDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, Search, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  // --- Filter state ---
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

  // --- Existing state ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StockOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockOut | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // --- URL param helper ---
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

  // --- Filter handlers ---
  const handleSearchChange = (value: string) => {
    setSearch(value);
    // swap for: debouncedSearch(value) → updateParams({ search: value })
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

  // --- Existing queries & mutations (unchanged) ---
  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: ["admin-inventory-stock-out", currentPage],
    queryFn: async () => {
      const res = await api.get<ListStockOutResponse>(
        `/admin/inventory/stock/out?page=${currentPage}`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { data: productsData, isPending: productsPending } = useQuery({
    queryKey: ["admin-inventory-stock-in"],
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

  if (isPending || !data || productsPending || !productsData)
    return <StockOutLoading />;
  if (isError) return <StockOutError error={error} reset={refetch} />;
  if (!data.success || !productsData.success)
    return (
      <StockOutError
        error={{ ...data, message: "Failed to process request" }}
        reset={refetch}
      />
    );

  const records = data.data;
  const limit = data.meta.limit;
  const total = data.meta.total;
  const totalPages = data.meta.totalPages;

  // --- Local filter + sort (swap for API params later) ---
  const filtered = records
    .filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        r.productName.toLowerCase().includes(q) ||
        r.billNo?.toLowerCase().includes(q);
      const matchesFrom = !dateFrom || r.date >= dateFrom;
      const matchesTo = !dateTo || r.date <= dateTo;
      return matchesSearch && matchesFrom && matchesTo;
    })
    .sort((a, b) => {
      if (!priceSort) return 0;
      return priceSort === "asc" ? a.rate - b.rate : b.rate - a.rate;
    });

  // --- Existing handlers (unchanged) ---
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
    <div className="space-y-4 min-h-screen bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8 mx-auto max-w-8xl">
      <InventoryPageHeader
        title="Stock Out"
        description="Record outgoing inventory and sales."
        action={
          <Button
            onClick={() => {
              setEditTarget(null);
              setDialogOpen(true);
            }}
            className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white font-[var(--font-dm-sans)] gap-2"
          >
            <Plus size={16} /> Add Stock Out
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
              placeholder="Search by product name or bill no…"
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

        {/* Row 2: Date range + Apply + Clear + count */}
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
              className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white shrink-0"
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

      <StockOutTable
        data={filtered}
        limit={limit}
        total={filtered.length}
        currentPage={currentPage}
        totalPages={Math.ceil(filtered.length / limit)}
        onPageChange={setCurrentPage}
        onEdit={(item) => {
          setEditTarget(item);
          setDialogOpen(true);
        }}
        onDelete={setDeleteTarget}
      />

      <StockOutDialog
        open={dialogOpen}
        products={productsData.data}
        stockOut={records}
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
    </div>
  );
}
