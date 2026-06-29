"use client";

import { Loader2 } from "lucide-react";
import { SupplierLedgerEntryRow } from "./SupplierLedgerEntryRow";
import { SupplierLedger } from "@repo/types";
import {
  accountingThClass,
  accountingTableWrapClass,
} from "../shared/accounting-styles";

const COL_SPAN_WITH = 7;
const COL_SPAN_WITHOUT = 6;
const thSticky = `${accountingThClass} sticky top-0 z-10`;
const tableClass = "w-full table-fixed border-collapse text-left text-sm";

function LedgerColGroup({
  showSupplierColumn,
}: {
  showSupplierColumn: boolean;
}) {
  if (showSupplierColumn) {
    return (
      <colgroup>
        <col style={{ width: "5%" }} />
        <col style={{ width: "11%" }} />
        <col style={{ width: "20%" }} />
        <col style={{ width: "6%" }} />
        <col style={{ width: "14%" }} />
        <col style={{ width: "14%" }} />
        <col style={{ width: "30%" }} />
      </colgroup>
    );
  }

  return (
    <colgroup>
      <col style={{ width: "6%" }} />
      <col style={{ width: "13%" }} />
      <col style={{ width: "7%" }} />
      <col style={{ width: "16%" }} />
      <col style={{ width: "16%" }} />
      <col style={{ width: "42%" }} />
    </colgroup>
  );
}

interface SupplierLedgerTableProps {
  entries: SupplierLedger[];
  isFetchingNextPage: boolean;
  hasReachedEnd: boolean;
  totalCount: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  showSupplierColumn?: boolean;
}

export function SupplierLedgerTable({
  entries,
  isFetchingNextPage,
  hasReachedEnd: _hasReachedEnd,
  totalCount,
  scrollContainerRef,
  onScroll,
  showSupplierColumn = true,
}: SupplierLedgerTableProps) {
  const colSpan = showSupplierColumn ? COL_SPAN_WITH : COL_SPAN_WITHOUT;

  const totalDebit = entries
    .filter((e) => e.entryType === "dr")
    .reduce((s, e) => s + e.amount, 0);
  const totalCredit = entries
    .filter((e) => e.entryType === "cr")
    .reduce((s, e) => s + e.amount, 0);

  const fmt = (n: number) =>
    "Rs. " +
    (n / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div
      className={`${accountingTableWrapClass} flex w-full flex-col`}
      style={{
        height: "calc(100vh - 360px)",
        minHeight: "320px",
      }}
    >
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="w-full flex-1 overflow-auto"
      >
        <table className={tableClass}>
          <LedgerColGroup showSupplierColumn={showSupplierColumn} />
          <thead>
            <tr>
              <th className={`${thSticky} text-center`}>S.No</th>
              <th className={thSticky}>Date (BS)</th>
              {showSupplierColumn && <th className={thSticky}>Supplier</th>}
              <th className={`${thSticky} text-center`}>D/C</th>
              <th className={`${thSticky} text-right`}>Debit (Rs.)</th>
              <th className={`${thSticky} text-right`}>Credit (Rs.)</th>
              <th className={`${thSticky} whitespace-normal`}>Narration</th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry, idx) => (
              <SupplierLedgerEntryRow
                key={entry.id}
                entry={entry}
                serialNo={idx + 1}
                showSupplierColumn={showSupplierColumn}
              />
            ))}
          </tbody>

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
            <tr className="border-t border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.03)] text-xs font-semibold">
              <td
                colSpan={showSupplierColumn ? 4 : 3}
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
        </table>
      </div>
    </div>
  );
}
