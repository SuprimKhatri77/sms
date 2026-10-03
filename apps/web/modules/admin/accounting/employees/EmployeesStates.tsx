"use client";

import { AlertCircle } from "lucide-react";
import { EmptyState } from "../../inventory/shared/EmptyState";
import {
  accountingTableClass,
  accountingTableWrapClass,
  accountingTdClass,
  accountingThClass,
} from "../shared/accounting-styles";

const COLUMNS = ["Code", "Name", "Phone", "Salary", "Joined", "Status", "Actions"];

export function EmployeesSkeleton() {
  return (
    <div className={`${accountingTableWrapClass} animate-pulse`}>
      <table className={accountingTableClass}>
        <thead>
          <tr>
            {COLUMNS.map((label) => (
              <th key={label} className={accountingThClass}>
                <div className="h-3 w-14 bg-[rgba(47,78,64,0.08)]" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              {COLUMNS.map((label) => (
                <td key={label} className={accountingTdClass}>
                  <div className="h-4 w-20 bg-[rgba(47,78,64,0.06)]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmployeesEmpty({ filtered }: { filtered: boolean }) {
  return (
    <EmptyState
      message={
        filtered
          ? "No employees match these filters."
          : "No employees yet. Add your staff to record their salary in the ledger."
      }
    />
  );
}

export function EmployeesError({
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
        <p className="font-(family-name:--font-lora) text-base font-semibold text-[#1a1a1a]">
          Failed to load employees
        </p>
        <p className="mt-1 font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.55)]">
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="border border-[rgba(47,78,64,0.2)] px-4 py-2 font-(family-name:--font-dm-sans) text-sm font-medium text-(--brand-green) transition-colors hover:bg-[rgba(47,78,64,0.04)]"
      >
        Try again
      </button>
    </div>
  );
}
