import { AlertCircle, ClipboardList, Plus } from "lucide-react";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import {
  accountingTableWrapClass,
  accountingThClass,
} from "../shared/accounting-styles";

const skeletonThClass = `${accountingThClass} bg-[rgba(47,78,64,0.03)]`;

export function LedgersSkeleton() {
  return (
    <div
      className={`${accountingTableWrapClass} flex w-full animate-pulse flex-col overflow-hidden`}
      style={{ height: "calc(100vh - 360px)", minHeight: "320px" }}
    >
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <thead>
          <tr>
            {Array.from({ length: 7 }).map((_, i) => (
              <th key={i} className={skeletonThClass}>
                <div className="h-3 w-3/4 bg-[rgba(47,78,64,0.08)]" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 12 }).map((_, i) => (
            <tr key={i} className="border-b border-[rgba(47,78,64,0.08)]">
              {Array.from({ length: 7 }).map((_, j) => (
                <td key={j} className="px-5 py-4">
                  <div
                    className="h-3 bg-[rgba(47,78,64,0.06)]"
                    style={{ width: `${55 + (j % 3) * 15}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LedgersError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center border border-red-200 bg-red-50 text-red-500">
        <AlertCircle size={20} strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-(family-name:--font-lora) text-base font-semibold text-(--brand-ink)">
          Failed to load ledger
        </p>
        <p className="mt-1 font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.55)]">
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={adminSecondaryButtonClass}
      >
        Try again
      </button>
    </div>
  );
}

export function LedgersEmpty({
  filtered,
  onCreateEntry,
}: {
  filtered: boolean;
  onCreateEntry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <ClipboardList
        className="h-10 w-10 text-[rgba(47,78,64,0.2)]"
        strokeWidth={1.25}
      />
      <div>
        <p className="font-(family-name:--font-lora) text-base font-semibold text-(--brand-ink)">
          {filtered
            ? "No entries match these filters"
            : "No ledger entries yet"}
        </p>
        <p className="mt-1 font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.45)]">
          {filtered
            ? "Try a different ledger, party or date range."
            : "Record a cash, bank or supplier entry to get started."}
        </p>
      </div>
      <button
        type="button"
        onClick={onCreateEntry}
        className={adminPrimaryButtonClass}
      >
        <Plus size={15} strokeWidth={2.5} />
        New Entry
      </button>
    </div>
  );
}
