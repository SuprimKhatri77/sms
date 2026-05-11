"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { WastageTable } from "./WastageTable";
import { WastageDialog } from "./WastageDialog";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, Search, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") ?? "");
  const [pendingFrom, setPendingFrom] = useState(
    searchParams.get("from") ?? "",
  );
  const [pendingTo, setPendingTo] = useState(searchParams.get("to") ?? "");
  const [createdSort, setCreatedSort] = useState<"asc" | "desc" | "">(
    (searchParams.get("sort") as "asc" | "desc") ?? "",
  );
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | "">(
    (searchParams.get("priceSort") as "asc" | "desc") ?? "",
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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateParams({ search: value });
    setCurrentPage(1);
  };

  const handleApplyDates = () => {
    setDateFrom(pendingFrom);
    setDateTo(pendingTo);
    updateParams({ from: pendingFrom, to: pendingTo });
    setCurrentPage(1);
  };

  const handleCreatedSort = (value: "asc" | "desc" | "") => {
    setCreatedSort(value);
    updateParams({ sort: value });
    setCurrentPage(1);
  };

  const handlePriceSort = (value: "asc" | "desc" | "") => {
    setPriceSort(value);
    updateParams({ priceSort: value });
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearch("");
    setPendingFrom("");
    setPendingTo("");
    setDateFrom("");
    setDateTo("");
    setPriceSort("");
    setCreatedSort("");
    setCurrentPage(1);
    router.push(pathname);
  };

  const hasActiveFilters =
    !!search || !!dateFrom || !!dateTo || !!createdSort || !!priceSort;
  const hasPendingDateChange = pendingFrom !== dateFrom || pendingTo !== dateTo;

  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: ["admin-inventory-wastage", currentPage],
    queryFn: async () => {
      const res = await api.get<ListWastageResponse>(
        `/admin/inventory/wastages?page=${currentPage}`,
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

  if (isPending || !data || productsPending || !productsData)
    return <WastageLoading />;
  if (isError) return <WastageError error={error} reset={refetch} />;
  if (!data.success || !productsData.success)
    return (
      <WastageError
        error={{ ...data, message: "Failed to process request" }}
        reset={refetch}
      />
    );

  const records = data.data;
  const limit = data.meta.limit;
  const total = data.meta.total;
  const totalPages = data.meta.totalPages;

  const filtered = records
    .filter((r) => {
      const matchesSearch =
        !search || r.productName.toLowerCase().includes(search.toLowerCase());
      const matchesFrom = !dateFrom || r.date >= dateFrom;
      const matchesTo = !dateTo || r.date <= dateTo;
      return matchesSearch && matchesFrom && matchesTo;
    })
    .sort((a, b) => {
      if (!createdSort) return 0;
      const diff =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return createdSort === "asc" ? diff : -diff;
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
    <div className="space-y-4 min-h-screen bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <InventoryPageHeader
        title="Wastage"
        description="Track damaged, expired, or lost inventory."
        action={
          <Button
            onClick={() => {
              setEditTarget(null);
              setDialogOpen(true);
            }}
            className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white font-[var(--font-dm-sans)] gap-2"
          >
            <Plus size={16} /> Log Wastage
          </Button>
        }
      />

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Search + Created sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by product name…"
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

          <Select
            value={createdSort}
            onValueChange={(v) => handleCreatedSort(v as "asc" | "desc" | "")}
          >
            <SelectTrigger
              className="w-full sm:w-48"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <SelectValue placeholder="Sort by created date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default</SelectItem>
              <SelectItem value="asc">Created: Oldest first</SelectItem>
              <SelectItem value="desc">Created: Newest first</SelectItem>
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

      <WastageTable
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

      <WastageDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        onSubmit={handleSubmit}
        initialData={editTarget}
        products={productsData.data}
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
