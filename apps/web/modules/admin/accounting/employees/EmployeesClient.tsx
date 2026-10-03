"use client";

import { useCallback, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { Employee, EmployeeInput, EmployeeStatus } from "@repo/types";
import { cn } from "@/lib/utils";
import { useEmployees } from "@/hooks/queries/admin/employees/useEmployees";
import { useCreateEmployee } from "@/hooks/mutations/admin/employees/useCreateEmployee";
import { useUpdateEmployee } from "@/hooks/mutations/admin/employees/useUpdateEmployee";
import { useDeleteEmployee } from "@/hooks/mutations/admin/employees/useDeleteEmployee";
import { useDebounce } from "@/modules/admin/analytics/hooks/useDebounce";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  useAdminClearFiltersShortcut,
  useAdminEscapeShortcut,
  useAdminFocusSearchShortcut,
  useAdminNewShortcut,
  useAdminRefreshShortcut,
} from "@/components/admin/admin-shortcut-provider";
import { useAdminQueryRefresh } from "@/hooks/useAdminQueryRefresh";
import {
  adminInputClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-styles";
import {
  AccountingFilterShell,
  accountingLabelClass,
  accountingTableWrapClass,
} from "../shared/accounting-styles";
import { ConfirmDialog } from "../../inventory/shared/ConfirmDialog";
import {
  StaticSelect,
  type StaticSelectOption,
} from "../../inventory/shared/StaticSelect";
import { EmployeeDialog } from "./EmployeeDialog";
import { EmployeesTable } from "./EmployeesTable";
import {
  EmployeesEmpty,
  EmployeesError,
  EmployeesSkeleton,
} from "./EmployeesStates";

const ALL = "all" as const;
type StatusFilter = EmployeeStatus | typeof ALL;

const STATUS_FILTER_OPTIONS: StaticSelectOption<StatusFilter>[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: ALL, label: "All employees" },
];

// the list opens on the people still working here
const DEFAULT_STATUS: StatusFilter = "active";

export default function EmployeesClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>(DEFAULT_STATUS);
  const debouncedSearch = useDebounce(search.trim(), 400);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // a fresh key per open, so the form always starts from the employee (or blank)
  const [dialog, setDialog] = useState<{
    key: number;
    employee: Employee | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const { data, isPending, isError, error, refetch } = useEmployees({
    page,
    q: debouncedSearch,
    status: status === ALL ? "" : status,
  });

  // the page we're on can run out (its last employee deleted or marked
  // inactive); step back to the last page there is (adjusted while
  // rendering, as React suggests for state that follows other state)
  const totalPages = data?.meta.totalPages ?? 0;
  if (totalPages > 0 && page > totalPages) setPage(totalPages);

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const openCreate = useCallback(
    () => setDialog({ key: Date.now(), employee: null }),
    [],
  );
  // the "new" shortcut opens the add form, or closes it; it leaves an open
  // edit alone
  const toggleCreate = useCallback(
    () =>
      setDialog((d) => {
        if (!d) return { key: Date.now(), employee: null };
        return d.employee ? d : null;
      }),
    [],
  );
  const handleClear = useCallback(() => {
    setSearch("");
    setStatus(DEFAULT_STATUS);
    setPage(1);
  }, []);

  useAdminNewShortcut(toggleCreate);
  useAdminFocusSearchShortcut(
    useCallback(() => searchInputRef.current?.focus(), []),
  );
  useAdminClearFiltersShortcut(handleClear);
  useAdminRefreshShortcut(useAdminQueryRefresh(refetch));
  useAdminEscapeShortcut(
    useCallback(() => {
      if (deleteTarget) setDeleteTarget(null);
      else if (dialog) setDialog(null);
    }, [deleteTarget, dialog]),
  );

  const handleSubmit = async (input: EmployeeInput) => {
    if (dialog?.employee) {
      await updateEmployee.mutateAsync({
        employeeID: dialog.employee.id,
        data: input,
      });
    } else {
      await createEmployee.mutateAsync(input);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEmployee.mutateAsync({ employeeID: deleteTarget.id });
    } catch {
      // the mutation's toast says why (e.g. they have salary entries)
    }
    setDeleteTarget(null);
  };

  const isFiltered = !!debouncedSearch || status !== DEFAULT_STATUS;

  return (
    <AdminPageLayout
      title="Employees"
      description="Staff paid through the salary ledger. Each has a code that tells apart people with the same name."
      maxWidth="wide"
      action={
        <button
          type="button"
          onClick={openCreate}
          className={adminPrimaryButtonClass}
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Employee
        </button>
      }
    >
      <div className="space-y-6">
        <AccountingFilterShell
          hasActiveFilters={isFiltered || search !== ""}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
              <label className={accountingLabelClass} htmlFor="employee-search">
                Search
              </label>
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]" />
                <input
                  ref={searchInputRef}
                  id="employee-search"
                  placeholder="Name or code, e.g. EMP-004"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    // a new search starts from the first page (set now, not
                    // once the search settles, so no request asks for a page
                    // the new results don't have)
                    setPage(1);
                  }}
                  className={cn(
                    adminInputClass,
                    "rounded-none pl-9 normal-case tracking-normal",
                  )}
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <span className={accountingLabelClass}>Status</span>
              <StaticSelect
                aria-label="Status"
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
                options={STATUS_FILTER_OPTIONS}
              />
            </div>
          </div>
        </AccountingFilterShell>

        <div className="min-h-80">
          {isPending ? (
            <EmployeesSkeleton />
          ) : isError ? (
            <div className={accountingTableWrapClass}>
              <EmployeesError
                message={
                  error?.response?.data.message ?? "Something went wrong"
                }
                onRetry={refetch}
              />
            </div>
          ) : data.meta.total === 0 ? (
            <div className={accountingTableWrapClass}>
              <EmployeesEmpty filtered={isFiltered} />
            </div>
          ) : (
            <EmployeesTable
              employees={data.employees}
              meta={data.meta}
              onEdit={(employee) => setDialog({ key: Date.now(), employee })}
              onDelete={setDeleteTarget}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {dialog && (
        <EmployeeDialog
          key={dialog.key}
          open
          onOpenChange={(open) => !open && setDialog(null)}
          employee={dialog.employee}
          loading={createEmployee.isPending || updateEmployee.isPending}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open
          itemName={`${deleteTarget.code} ${deleteTarget.fullName}`}
          isLoading={deleteEmployee.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AdminPageLayout>
  );
}
