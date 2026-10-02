"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Toaster } from "sonner";
import { AxiosError } from "axios";
import { BSToAD } from "bikram-sambat-js";
import {
  LEDGER_TYPES,
  ledgerTypeValues,
  type APIError,
  type LedgerEntriesData,
  type LedgerEntry,
  type LedgerEntryInput,
  type LedgerType,
} from "@repo/types";
import { queryKeys } from "@/lib/query-keys";
import {
  getLedgerEntries,
  ledgerFilterQuery,
  type LedgerFilterParams,
} from "@/lib/api/ledgers";
import { useLedgerSummary } from "@/hooks/queries/admin/ledgers/useLedgerSummary";
import { useAccountGroups } from "@/hooks/queries/admin/account_groups/useAccountGroups";
import { useCreateLedgerEntry } from "@/hooks/mutations/admin/ledgers/useCreateLedgerEntry";
import { useUpdateLedgerEntry } from "@/hooks/mutations/admin/ledgers/useUpdateLedgerEntry";
import { useDeleteLedgerEntry } from "@/hooks/mutations/admin/ledgers/useDeleteLedgerEntry";
import { useAuthStore } from "@/store/auth";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { AdminExportMenu } from "@/components/admin/admin-export-menu";
import {
  useAdminEscapeShortcut,
  useAdminNewShortcut,
  useAdminRefreshShortcut,
} from "@/components/admin/admin-shortcut-provider";
import { useAdminQueryRefresh } from "@/hooks/useAdminQueryRefresh";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { accountingTableWrapClass } from "../shared/accounting-styles";
import { ConfirmDialog } from "../../inventory/shared/ConfirmDialog";
import {
  EMPTY_LEDGER_FILTERS,
  LedgersFilters,
  type LedgerFilterState,
} from "./LedgersFilters";
import { LedgerSummaryCards } from "./LedgerSummaryCards";
import { LedgersTable } from "./LedgersTable";
import { LedgerEntryDialog } from "./LedgerEntryDialog";
import { LedgersEmpty, LedgersError, LedgersSkeleton } from "./LedgersStates";
import { formatRs } from "./format";

// The filters live in the URL by id (with the picked names alongside, so
// the pickers can show them), so a reload or shared link keeps them.
const URL_PARAMS = {
  ledgerType: "type",
  supplierID: "supplier_id",
  supplierName: "supplier_name",
  bankID: "bank_id",
  bankName: "bank_name",
  accountID: "account_id",
  accountName: "account_name",
  accountGroupID: "account_group_id",
  fromBsDate: "from_bs",
  toBsDate: "to_bs",
} as const satisfies Partial<Record<keyof LedgerFilterState, string>>;

function bsToAD(bs: string): string {
  if (!bs) return "";
  try {
    return BSToAD(bs);
  } catch {
    return "";
  }
}

function filtersFromURL(params: URLSearchParams): LedgerFilterState {
  const state = { ...EMPTY_LEDGER_FILTERS };
  for (const [key, param] of Object.entries(URL_PARAMS)) {
    (state as Record<string, string>)[key] = params.get(param) ?? "";
  }
  if (!ledgerTypeValues.includes(state.ledgerType as LedgerType)) {
    state.ledgerType = "";
  }
  state.fromDate = bsToAD(state.fromBsDate);
  state.toDate = bsToAD(state.toBsDate);
  if (!state.fromDate) state.fromBsDate = "";
  if (!state.toDate) state.toBsDate = "";
  return state;
}

function toQueryFilters(f: LedgerFilterState): LedgerFilterParams {
  return {
    ledgerType: f.ledgerType,
    supplierID: f.supplierID,
    bankID: f.bankID,
    accountID: f.accountID,
    accountGroupID: f.accountGroupID,
    fromDate: f.fromDate,
    toDate: f.toDate,
  };
}

function deleteLabel(entry: LedgerEntry): string {
  const what =
    entry.ledgerType === "supplier" && entry.counterEntryId
      ? "this supplier payment and its cash/bank entry"
      : `this ${LEDGER_TYPES[entry.ledgerType].label.toLowerCase()} entry`;
  return `${what} (${formatRs(entry.amount)} on ${entry.bsDate})`;
}

function LedgersInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canManage = useAuthStore((s) => s.user?.role === "superadmin");

  const [filters, setFilters] = useState<LedgerFilterState>(() =>
    filtersFromURL(new URLSearchParams(searchParams.toString())),
  );
  const queryFilters = useMemo(() => toQueryFilters(filters), [filters]);

  const handleFilterChange = useCallback(
    (next: LedgerFilterState) => {
      setFilters(next);
      const params = new URLSearchParams();
      for (const [key, param] of Object.entries(URL_PARAMS)) {
        const value = next[key as keyof LedgerFilterState];
        if (value) params.set(param, value);
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname],
  );

  // a fresh key per open, so the form always starts from the entry (or blank)
  const [dialog, setDialog] = useState<{
    key: number;
    entry: LedgerEntry | null;
  } | null>(null);
  const openCreate = useCallback(
    () => setDialog({ key: Date.now(), entry: null }),
    [],
  );
  // the "new" shortcut opens the add form, or closes it; it leaves an open
  // edit alone
  const toggleCreate = useCallback(
    () =>
      setDialog((d) => {
        if (!d) return { key: Date.now(), entry: null };
        return d.entry ? d : null;
      }),
    [],
  );
  const [deleteTarget, setDeleteTarget] = useState<LedgerEntry | null>(null);

  const { data: accountGroups = [] } = useAccountGroups();
  const summaryQuery = useLedgerSummary(queryFilters);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<LedgerEntriesData, AxiosError<APIError>>({
    queryKey: queryKeys.ledgers.list(queryFilters),
    queryFn: ({ pageParam = 1 }) =>
      getLedgerEntries(pageParam as number, queryFilters),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });
  const entries = useMemo(
    () => data?.pages.flatMap((p) => p.entries) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.meta.total ?? 0;

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetchingNextPage) return;
      const el = e.currentTarget;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 200)
        void fetchNextPage();
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const createEntry = useCreateLedgerEntry();
  const updateEntry = useUpdateLedgerEntry();
  const deleteEntry = useDeleteLedgerEntry();

  const handleSubmit = async (input: LedgerEntryInput) => {
    if (dialog?.entry) {
      await updateEntry.mutateAsync({ id: dialog.entry.id, data: input });
    } else {
      await createEntry.mutateAsync(input);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteEntry.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  useAdminNewShortcut(toggleCreate);
  useAdminRefreshShortcut(useAdminQueryRefresh(refetch));
  useAdminEscapeShortcut(
    useCallback(() => {
      if (deleteTarget) setDeleteTarget(null);
      else if (dialog) setDialog(null);
    }, [deleteTarget, dialog]),
  );

  const isFiltered = Object.values(queryFilters).some(Boolean);

  return (
    <AdminPageLayout
      title="Ledgers"
      description="Cash, bank and supplier entries in one place"
      maxWidth="wide"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <AdminExportMenu
            path="/admin/accounting/ledgers/export"
            filters={ledgerFilterQuery(queryFilters)}
          />
          <button
            type="button"
            onClick={openCreate}
            className={adminPrimaryButtonClass}
          >
            <Plus size={15} strokeWidth={2.5} />
            New Entry
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <LedgerSummaryCards
          summary={summaryQuery.data}
          loading={summaryQuery.isPending}
        />

        <LedgersFilters
          filters={filters}
          onChange={handleFilterChange}
          accountGroups={accountGroups}
        />

        <div className="min-h-80 w-full">
          {isLoading && <LedgersSkeleton />}

          {isError && (
            <div className={accountingTableWrapClass}>
              <LedgersError
                message={
                  error?.response?.data.message ?? "Something went wrong"
                }
                onRetry={refetch}
              />
            </div>
          )}

          {!isLoading && !isError && entries.length === 0 && (
            <div className={accountingTableWrapClass}>
              <LedgersEmpty filtered={isFiltered} onCreateEntry={openCreate} />
            </div>
          )}

          {!isLoading && !isError && entries.length > 0 && (
            <LedgersTable
              entries={entries}
              totalCount={totalCount}
              isFetchingNextPage={isFetchingNextPage}
              scrollContainerRef={scrollContainerRef}
              onScroll={handleScroll}
              canManage={canManage}
              onEdit={(entry) => setDialog({ key: Date.now(), entry })}
              onDelete={setDeleteTarget}
            />
          )}
        </div>
      </div>

      {dialog && (
        <LedgerEntryDialog
          key={dialog.key}
          open
          onOpenChange={(open) => !open && setDialog(null)}
          entry={dialog.entry}
          defaultLedgerType={filters.ledgerType}
          accountGroups={accountGroups}
          loading={createEntry.isPending || updateEntry.isPending}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open
          itemName={deleteLabel(deleteTarget)}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Toaster />
    </AdminPageLayout>
  );
}

export default function LedgersClient() {
  return (
    <Suspense>
      <LedgersInner />
    </Suspense>
  );
}
