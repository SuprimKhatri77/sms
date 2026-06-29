"use client";

import { useCallback, useRef, useMemo, Suspense, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { FilterState, LedgerFilters } from "./LedgerFilters";
import { LedgerSummaryCards } from "./LedgerSummaryCard";
import { LedgerTable } from "./LedgerTable";
import { CreateLedgerEntryForm } from "./CreateLedgerEntryForm";
import { Toaster } from "sonner";
import { getBankLedger } from "@/lib/api/bank_ledger";
import { BankLedgerData, CreateBankLedgerEntryInput } from "@repo/types";
import { useBankLedgerSummary } from "@/hooks/queries/admin/banks/bank_ledger/useBankLedgerSummary";
import { useBankAccountsDropdown } from "@/hooks/queries/admin/banks/bank_ledger/useBankAccountsDropdown";
import { useCreateBankLedgerEntry } from "@/hooks/mutations/admin/bank_ledger/useCreateBankLedgerEntry";
import { queryKeys } from "@/lib/query-keys";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";

const PARAM_BANK_NAME = "bank_name";
const PARAM_ACCOUNT_NAME = "account_name";

function LedgerPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState<boolean>(false);

  const [bankId, setBankId] = useState("all");
  const [accountId, setAccountId] = useState("all");

  const bankName = searchParams.get(PARAM_BANK_NAME) ?? "all";
  const accountName = searchParams.get(PARAM_ACCOUNT_NAME) ?? "all";

  const filters: FilterState = { bankId, accountId, bankName, accountName };

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const setSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "all" || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const handleFilterChange = useCallback(
    (next: FilterState) => {
      setBankId(next.bankId);
      setAccountId(next.accountId);
      setSearchParams({
        [PARAM_BANK_NAME]: next.bankName,
        [PARAM_ACCOUNT_NAME]: next.accountName,
      });
    },
    [setSearchParams],
  );

  const accountsQuery = useBankAccountsDropdown();

  const summaryQuery = useBankLedgerSummary({
    accountID: accountId,
    bankID: bankId,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isEntriesLoading,
    isError,
    refetch,
  } = useInfiniteQuery<BankLedgerData>({
    queryKey: queryKeys.bankLedger.list(bankId, accountId),
    queryFn: ({ pageParam = 1 }) =>
      getBankLedger({
        page: pageParam as number,
        bankID: bankId !== "all" ? bankId : undefined,
        accountID: accountId !== "all" ? accountId : undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const entries = useMemo(
    () => data?.pages.flatMap((p) => p.bankLedger) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.meta.total ?? 0;
  const hasReachedEnd = !hasNextPage && !isEntriesLoading;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetchingNextPage) return;
      const el = e.currentTarget;
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distanceFromBottom < 200) {
        void fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const createBankLedgerEntry = useCreateBankLedgerEntry();

  const handleCreateBankLedger = async (
    data: CreateBankLedgerEntryInput & { accountID: string },
  ) => {
    await createBankLedgerEntry.mutateAsync(data);
  };

  const accounts = accountsQuery.data ?? [];
  const summary = summaryQuery.data ?? null;
  const summaryLoading = summaryQuery.isPending;

  return (
    <AdminPageLayout
      title="Bank Ledger"
      description="All financial transactions across every bank account"
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
        <LedgerSummaryCards
          summary={summaryLoading ? null : summary}
          loading={summaryLoading}
        />

        <LedgerFilters
          accounts={accounts}
          filters={filters}
          onChange={handleFilterChange}
        />

        <LedgerTable
          entries={entries}
          initialLoading={isEntriesLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasReachedEnd={hasReachedEnd}
          totalCount={totalCount}
          scrollContainerRef={scrollContainerRef}
          onScroll={handleScroll}
          onCreateEntry={() => setFormOpen(true)}
          showBankColumns={true}
          isError={isError}
          refetch={refetch}
        />
      </div>

      <CreateLedgerEntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        accounts={accounts}
        createLedgerEntry={(data) => handleCreateBankLedger(data)}
      />

      <Toaster />
    </AdminPageLayout>
  );
}

export default function UnifiedLedgerPage() {
  return (
    <Suspense>
      <LedgerPageInner />
    </Suspense>
  );
}
