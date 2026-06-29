"use client";

import { useCallback, useRef, useMemo, Suspense, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Toaster } from "sonner";
import { CashLedgerTable } from "./CashLedgerTable";
import { CashLedgerSummaryCards } from "./CashLedgerSummaryCards";
import { CreateCashLedgerEntryForm } from "./CreateCashLedgerEntryForm";
import { CashLedgerData, CreateCashLedgerEntryInput } from "@repo/types";
import { getCashLedger } from "@/lib/api/cash_ledger";
import { queryKeys } from "@/lib/query-keys";
import { CashLedgerFilters } from "./CashLedgerFilter";
import { useCreateCashLedgerEntry } from "@/hooks/mutations/admin/cash_ledger/useCreateCashLedgerEntry";
import { useCashLedgerSummary } from "@/hooks/queries/admin/cash_ledger/useCashLedger";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";

const PARAM_FROM_BS = "from_bs";
const PARAM_TO_BS = "to_bs";

function CashLedgerPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);

  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  const fromBsDate = searchParams.get(PARAM_FROM_BS);
  const toBsDate = searchParams.get(PARAM_TO_BS);

  const filters: CashLedgerFilters = {
    fromDate,
    toDate,
    fromBsDate,
    toBsDate,
  };

  const setSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const handleFilterChange = useCallback(
    (next: CashLedgerFilters) => {
      setFromDate(next.fromDate);
      setToDate(next.toDate);
      setSearchParams({
        [PARAM_FROM_BS]: next.fromBsDate,
        [PARAM_TO_BS]: next.toBsDate,
      });
    },
    [setSearchParams],
  );

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery<CashLedgerData>({
    queryKey: queryKeys.cashLedger.list(fromDate, toDate),
    queryFn: ({ pageParam = 1 }) =>
      getCashLedger({
        page: pageParam as number,
        fromAD: fromDate,
        toAD: toDate,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });
  const entries = useMemo(
    () => data?.pages.flatMap((p) => p.cashLedger) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.meta.total ?? 0;
  const hasReachedEnd = !hasNextPage && !isLoading;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetchingNextPage) return;
      const el = e.currentTarget;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
        void fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const createCashLedgerEntry = useCreateCashLedgerEntry();
  const handleCreateEntry = async (data: CreateCashLedgerEntryInput) => {
    await createCashLedgerEntry.mutateAsync(data);
  };

  const summaryQuery = useCashLedgerSummary({ fromDate, toDate });
  const summary = summaryQuery.data ?? null;
  const summaryLoading = summaryQuery.isPending;

  return (
    <AdminPageLayout
      title="Cash Ledger"
      description="All cash transactions recorded across the academy"
      maxWidth="wide"
      action={
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className={adminPrimaryButtonClass}
        >
          <Plus size={15} strokeWidth={2.5} />
          New Entry
        </button>
      }
    >
      <div className="space-y-6">
        <CashLedgerSummaryCards
          summary={summaryLoading ? null : summary}
          loading={summaryLoading}
        />

        <CashLedgerFilters filters={filters} onChange={handleFilterChange} />

        <CashLedgerTable
          entries={entries}
          initialLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasReachedEnd={hasReachedEnd}
          totalCount={totalCount}
          scrollContainerRef={scrollContainerRef}
          onScroll={handleScroll}
          onCreateEntry={() => setFormOpen(true)}
          isError={isError}
          refetch={refetch}
        />
      </div>

      <CreateCashLedgerEntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        createLedgerEntry={handleCreateEntry}
      />

      <Toaster />
    </AdminPageLayout>
  );
}

export default function CashLedgerPage() {
  return (
    <Suspense>
      <CashLedgerPageInner />
    </Suspense>
  );
}
