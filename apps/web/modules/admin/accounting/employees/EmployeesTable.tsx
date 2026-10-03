"use client";

import Link from "next/link";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import type { Employee, PaginationMeta } from "@repo/types";
import {
  adminDangerIconButtonClass,
  adminIconButtonClass,
} from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import { Pagination } from "../../inventory/shared/Pagination";
import {
  accountingTableClass,
  accountingTableScrollClass,
  accountingTableWrapClass,
  accountingTdClass,
  accountingThClass,
} from "../shared/accounting-styles";
import { formatRs } from "../ledgers/format";
import { employeeOptionLabel } from "../../inventory/shared/useProductSupplierSearch";

const muted = "text-[rgba(47,78,64,0.3)]";
const badgeClass =
  "inline-block border px-1.5 py-0.5 font-(family-name:--font-dm-sans) text-[10px] font-semibold uppercase tracking-[0.06em]";

/** The ledger page filtered to one employee's salary entries. */
export function employeeLedgerHref(employee: Employee): string {
  const params = new URLSearchParams({
    type: "salary",
    employee_id: employee.id,
    employee_name: employeeOptionLabel(employee.fullName, employee.code),
  });
  return `/admin/ledgers?${params.toString()}`;
}

interface EmployeesTableProps {
  employees: Employee[];
  meta: PaginationMeta;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onPageChange: (page: number) => void;
}

export function EmployeesTable({
  employees,
  meta,
  onEdit,
  onDelete,
  onPageChange,
}: EmployeesTableProps) {
  return (
    <div className={accountingTableWrapClass}>
      <div className={accountingTableScrollClass}>
        <table className={accountingTableClass}>
          <thead>
            <tr>
              <th className={accountingThClass}>Code</th>
              <th className={accountingThClass}>Name</th>
              <th className={accountingThClass}>Phone</th>
              <th className={`${accountingThClass} text-right`}>
                Monthly salary
              </th>
              <th className={accountingThClass}>Joined (BS)</th>
              <th className={accountingThClass}>Status</th>
              <th className={`${accountingThClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              const active = employee.status === "active";
              return (
                <tr
                  key={employee.id}
                  className="transition-colors hover:bg-[rgba(47,78,64,0.02)]"
                >
                  <td
                    className={`${accountingTdClass} whitespace-nowrap font-mono text-xs tracking-wide text-(--brand-green)`}
                  >
                    {employee.code}
                  </td>
                  <td className={accountingTdClass}>
                    <div className="font-medium">{employee.fullName}</div>
                    {employee.designation && (
                      <div className="mt-0.5 text-xs text-[rgba(47,78,64,0.5)]">
                        {employee.designation}
                      </div>
                    )}
                  </td>
                  <td
                    className={`${accountingTdClass} whitespace-nowrap font-(family-name:--font-dm-sans) text-[0.8125rem] text-[rgba(47,78,64,0.55)]`}
                  >
                    {employee.phone ?? <span className={muted}>—</span>}
                  </td>
                  <td
                    className={`${accountingTdClass} whitespace-nowrap text-right font-mono text-xs tabular-nums`}
                  >
                    {employee.monthlySalary ? (
                      formatRs(employee.monthlySalary)
                    ) : (
                      <span className={muted}>—</span>
                    )}
                  </td>
                  <td
                    className={`${accountingTdClass} whitespace-nowrap font-mono text-xs tabular-nums text-[rgba(47,78,64,0.55)]`}
                  >
                    {employee.joinDateBs ?? <span className={muted}>—</span>}
                  </td>
                  <td className={accountingTdClass}>
                    <span
                      className={cn(
                        badgeClass,
                        active
                          ? "border-[rgba(22,163,74,0.3)] bg-[rgba(22,163,74,0.06)] text-[#16a34a]"
                          : "border-[rgba(47,78,64,0.15)] bg-[rgba(47,78,64,0.04)] text-[rgba(47,78,64,0.5)]",
                      )}
                    >
                      {active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className={`${accountingTdClass} text-right`}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={employeeLedgerHref(employee)}
                        aria-label={`View ${employee.fullName}'s salary ledger`}
                        title="View salary ledger"
                        className={adminIconButtonClass}
                      >
                        <BookOpen size={13} strokeWidth={1.75} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(employee)}
                        aria-label={`Edit ${employee.fullName}`}
                        title="Edit"
                        className={adminIconButtonClass}
                      >
                        <Pencil size={13} strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(employee)}
                        aria-label={`Delete ${employee.fullName}`}
                        title="Delete"
                        className={adminDangerIconButtonClass}
                      >
                        <Trash2 size={13} strokeWidth={1.75} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={meta.page} meta={meta} onPageChange={onPageChange} />
    </div>
  );
}
