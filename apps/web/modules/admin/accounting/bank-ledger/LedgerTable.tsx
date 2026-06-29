"use client";

import { useEffect } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { LedgerEntryRow } from "./LedgerEntryRow";
import { EmptyLedgerState } from "./EmptyLedgerState";
import { BankLedger } from "@repo/types";
import {
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import {
  accountingTableWrapClass,
  accountingTableClass,
  accountingThClass,
} from "../shared/accounting-styles";

interface LedgerTableProps {
  entries: BankLedger[];
  initialLoading: boolean;
  isFetchingNextPage: boolean;
  hasReachedEnd: boolean;
  totalCount: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onCreateEntry: () => void;
  showBankColumns?: boolean;
  isError: boolean;
  refetch: () => void;
}

const thSticky = `${accountingThClass} sticky top-0 z-10`;

export function LedgerTable({
  entries,
  initialLoading,
  isFetchingNextPage,
  hasReachedEnd,
  totalCount,
  scrollContainerRef,
  onScroll,
  onCreateEntry,
  showBankColumns = true,
  isError,
  refetch,
}: LedgerTableProps) {
  const colSpan = showBankColumns ? 8 : 6;

  const totalDebit = entries
    .filter((e) => e.entryType === "dr")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCredit = entries
    .filter((e) => e.entryType === "cr")
    .reduce((sum, e) => sum + e.amount, 0);

  const fmt = (n: number) =>
    "Rs. " +
    (n / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  useEffect(() => {
    if (hasReachedEnd && entries.length > 0) {
      toast.info(`All ${totalCount} entries loaded`);
    }
  }, [hasReachedEnd, entries.length, totalCount]);

  return (
    <div
      className={`${accountingTableWrapClass} flex flex-col`}
      style={{
        height: "calc(100vh - 360px)",
        minHeight: "320px",
      }}
    >
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="flex-1 overflow-auto"
      >
        <table className={`${accountingTableClass} min-w-[720px] text-left text-sm`}>
          <thead>
            <tr>
              <th className={`${thSticky} w-12 text-center`}>S.No</th>
              <th className={`${thSticky} whitespace-nowrap`}>Date (BS)</th>
              {showBankColumns && (
                <>
                  <th className={thSticky}>Bank</th>
                  <th className={thSticky}>Account</th>
                </>
              )}
              <th className={`${thSticky} w-10 text-center`}>D/C</th>
              <th className={`${thSticky} text-right whitespace-nowrap`}>
                Debit (Rs.)
              </th>
              <th className={`${thSticky} text-right whitespace-nowrap`}>
                Credit (Rs.)
              </th>
              <th className={thSticky}>Narration</th>
            </tr>
          </thead>

          <tbody>
            {initialLoading ? (
              Array.from({ length: 40 }).map((_, i) => (
                <tr
                  key={i}
                  className="animate-pulse border-b border-[rgba(47,78,64,0.08)]"
                >
                  {Array.from({ length: colSpan }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 w-full bg-[rgba(47,78,64,0.06)]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : !isError && entries.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>
                  <EmptyLedgerState onCreateEntry={onCreateEntry} />
                </td>
              </tr>
            ) : (
              entries.map((entry, idx) => (
                <LedgerEntryRow
                  key={entry.id}
                  entry={entry}
                  serialNo={idx + 1}
                  showBankColumns={showBankColumns}
                />
              ))
            )}
          </tbody>

          {isError ? (
            <tbody>
              <tr>
                <td colSpan={colSpan}>
                  <div
                    className="flex flex-col items-center justify-center gap-4 py-20"
                    style={{ minHeight: "calc(100vh - 460px)" }}
                  >
                    <div className="flex h-11 w-11 items-center justify-center border border-red-200 bg-red-50 text-red-500">
                      <AlertCircle size={20} strokeWidth={1.75} />
                    </div>
                    <p className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-(--brand-ink)">
                      Failed to load ledger data. Please try again.
                    </p>
                    <button
                      type="button"
                      onClick={refetch}
                      className={adminSecondaryButtonClass}
                    >
                      <RefreshCw size={14} />
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            !initialLoading &&
            entries.length > 0 && (
              <tfoot className="sticky bottom-0 z-10">
                {isFetchingNextPage && (
                  <tr className="bg-[rgba(47,78,64,0.03)]">
                    <td colSpan={colSpan} className="px-5 py-2 text-center">
                      <span className="flex items-center justify-center gap-2 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
                        <Loader2 size={13} className="animate-spin" />
                        Loading more entries...
                      </span>
                    </td>
                  </tr>
                )}
                <tr className="border-t border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.03)] text-xs font-semibold whitespace-nowrap">
                  <td
                    colSpan={showBankColumns ? 5 : 3}
                    className="px-5 py-2 text-right font-[family-name:var(--font-dm-sans)] uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)]"
                  >
                    Loaded Total ({entries.length} of {totalCount})
                  </td>
                  <td className="px-5 py-2 text-right font-mono text-[#9a3412]">
                    {fmt(totalDebit)}
                  </td>
                  <td className="px-5 py-2 text-right font-mono text-[#16a34a]">
                    {fmt(totalCredit)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )
          )}
        </table>
      </div>
    </div>
  );
}
