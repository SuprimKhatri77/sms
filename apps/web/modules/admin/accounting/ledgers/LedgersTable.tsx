"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { LEDGER_TYPES, type LedgerEntry, type LedgerSource } from "@repo/types";
import {
  adminDangerIconButtonClass,
  adminIconButtonClass,
} from "@/components/admin/admin-styles";
import {
  accountingStickyTfootClass,
  accountingStickyTfootRowClass,
  accountingStickyThClass,
  accountingTableWrapClass,
  accountingTdClass,
} from "../shared/accounting-styles";
import { formatAmount, formatRs, partyLabel } from "./format";

// entries a purchase or payment wrote, and how they're labelled
const SOURCE_LABELS: Partial<Record<LedgerSource, string>> = {
  purchase: "Auto · purchase",
  student_payment: "Auto · student payment",
  supplier_payment: "Auto · supplier payment",
};

const th = accountingStickyThClass;
// fixed columns (cells pad 20px a side) so the narration wraps instead of
// pushing the actions off screen; below the min width (phones) the table
// scrolls sideways
const tableClass =
  "w-full min-w-[960px] table-fixed border-separate border-spacing-0 text-left text-sm";
const muted = "text-[rgba(47,78,64,0.2)]";
const badgeClass =
  "inline-block border px-1.5 py-0.5 font-(family-name:--font-dm-sans) text-[10px] font-semibold uppercase tracking-[0.06em]";

interface LedgersTableProps {
  entries: LedgerEntry[];
  totalCount: number;
  isFetchingNextPage: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  /** only superadmins edit or delete, and only manual entries */
  canManage: boolean;
  onEdit: (entry: LedgerEntry) => void;
  onDelete: (entry: LedgerEntry) => void;
}

export function LedgersTable({
  entries,
  totalCount,
  isFetchingNextPage,
  scrollContainerRef,
  onScroll,
  canManage,
  onEdit,
  onDelete,
}: LedgersTableProps) {
  const colSpan = canManage ? 8 : 7;
  const totalDebit = entries
    .filter((e) => e.entryType === "dr")
    .reduce((s, e) => s + e.amount, 0);
  const totalCredit = entries
    .filter((e) => e.entryType === "cr")
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div
      className={`${accountingTableWrapClass} flex w-full flex-col`}
      style={{ height: "calc(100vh - 360px)", minHeight: "320px" }}
    >
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="w-full flex-1 overflow-auto"
      >
        <table className={tableClass}>
          {/* cells pad 20px a side, so the short columns get fixed widths */}
          <colgroup>
            <col style={{ width: 64 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 112 }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: 124 }} />
            <col style={{ width: 124 }} />
            <col />
            {canManage && <col style={{ width: 104 }} />}
          </colgroup>
          <thead>
            <tr>
              <th className={`${th} text-center`}>S.No</th>
              <th className={th}>Date (BS)</th>
              <th className={th}>Ledger</th>
              <th className={th}>Party</th>
              <th className={`${th} text-right`}>Debit (Rs.)</th>
              <th className={`${th} text-right`}>Credit (Rs.)</th>
              <th className={th}>Narration</th>
              {canManage && <th className={th} />}
            </tr>
          </thead>

          <tbody>
            {entries.map((entry, idx) => {
              const isDebit = entry.entryType === "dr";
              const sourceLabel = SOURCE_LABELS[entry.source];
              const party = partyLabel(entry);
              return (
                <tr
                  key={entry.id}
                  className="transition-colors hover:bg-[rgba(47,78,64,0.02)]"
                >
                  <td
                    className={`${accountingTdClass} text-center tabular-nums text-[rgba(47,78,64,0.45)]`}
                  >
                    {idx + 1}
                  </td>
                  <td
                    className={`${accountingTdClass} whitespace-nowrap font-mono text-xs tabular-nums`}
                  >
                    {entry.bsDate}
                  </td>
                  <td className={accountingTdClass}>
                    <span
                      className={`${badgeClass} border-[rgba(47,78,64,0.18)] text-(--brand-green)`}
                    >
                      {LEDGER_TYPES[entry.ledgerType].label}
                    </span>
                  </td>
                  <td className={`${accountingTdClass} truncate`}>
                    <div className="truncate" title={party}>
                      {party || <span className={muted}>—</span>}
                    </div>
                    {entry.accountGroupName && (
                      <div
                        className="mt-0.5 truncate text-xs text-[rgba(47,78,64,0.5)]"
                        title={entry.accountGroupName}
                      >
                        {entry.accountGroupName}
                      </div>
                    )}
                  </td>
                  <td
                    className={`${accountingTdClass} whitespace-nowrap text-right font-mono text-xs tabular-nums ${isDebit ? "text-[#9a3412]" : muted}`}
                  >
                    {isDebit ? formatAmount(entry.amount) : "—"}
                  </td>
                  <td
                    className={`${accountingTdClass} whitespace-nowrap text-right font-mono text-xs tabular-nums ${!isDebit ? "text-[#16a34a]" : muted}`}
                  >
                    {!isDebit ? formatAmount(entry.amount) : "—"}
                  </td>
                  <td
                    className={`${accountingTdClass} text-[rgba(47,78,64,0.65)]`}
                  >
                    {/* the td's nowrap is inherited; wrap the narration */}
                    <div className="whitespace-normal wrap-break-word">
                      {entry.description ?? <span className={muted}>—</span>}
                    </div>
                    {(sourceLabel || entry.paymentType) && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {entry.paymentType && (
                          <span
                            className={`${badgeClass} border-[rgba(47,78,64,0.12)] text-[rgba(47,78,64,0.6)]`}
                          >
                            Paid by {entry.paymentType}
                            {entry.paidFromAccountName
                              ? ` · ${entry.paidFromAccountName}`
                              : ""}
                          </span>
                        )}
                        {sourceLabel && (
                          <span
                            className={`${badgeClass} border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)] text-[rgba(47,78,64,0.55)]`}
                          >
                            {sourceLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  {canManage && (
                    <td className={`${accountingTdClass} whitespace-nowrap`}>
                      {entry.source === "manual" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit(entry)}
                            className={adminIconButtonClass}
                            aria-label="Edit entry"
                          >
                            <Pencil
                              className="h-3.5 w-3.5"
                              strokeWidth={1.75}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(entry)}
                            className={adminDangerIconButtonClass}
                            aria-label="Delete entry"
                          >
                            <Trash2
                              className="h-3.5 w-3.5"
                              strokeWidth={1.75}
                            />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>

          <tfoot className={accountingStickyTfootClass}>
            {isFetchingNextPage && (
              <tr className="bg-white">
                <td colSpan={colSpan} className="px-5 py-2 text-center">
                  <span className="flex items-center justify-center gap-2 font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.45)]">
                    <Loader2 size={13} className="animate-spin" />
                    Loading more entries...
                  </span>
                </td>
              </tr>
            )}
            <tr className={accountingStickyTfootRowClass}>
              <td
                colSpan={4}
                className="whitespace-nowrap px-5 py-2 text-right font-(family-name:--font-dm-sans) uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)]"
              >
                Loaded total ({entries.length} of {totalCount})
              </td>
              <td className="whitespace-nowrap px-5 py-2 text-right font-mono text-[#9a3412]">
                {formatRs(totalDebit)}
              </td>
              <td className="whitespace-nowrap px-5 py-2 text-right font-mono text-[#16a34a]">
                {formatRs(totalCredit)}
              </td>
              <td colSpan={canManage ? 2 : 1} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
