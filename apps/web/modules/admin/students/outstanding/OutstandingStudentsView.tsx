"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { fetchOutstandingStudents } from "./lib/api";
import type {
  OutstandingFilters,
  OutstandingResponse,
  APIResponse,
} from "./types/outstanding";
import { StudentTableRow, StudentTableSkeleton } from "./StudentTableRow";
import { ErrorState } from "./OustandingError";
import { EmptyState } from "./OustandingEmpty";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  StudentFinanceSummary,
  formatSummaryNpr,
} from "../shared/StudentFinanceSummary";
import { StudentDateFilters } from "../shared/StudentDateFilters";
import { StudentUrlPagination } from "../shared/StudentUrlPagination";
import { StudentInitialsAvatar } from "../shared/StudentInitialsAvatar";
import { formatNpr } from "../shared/student-utils";
import { adminSecondaryButtonClass, adminTableClass } from "@/components/admin/admin-styles";

import { parseStudentFinanceFilters } from "../shared/student-date-filter-utils";

const thClass =
  "px-5 py-3.5 text-left font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.1em] text-[rgba(47,78,64,0.45)] bg-[rgba(47,78,64,0.03)] border-b border-[rgba(47,78,64,0.12)] whitespace-nowrap";

export function OutstandingStudentsView() {
  const searchParams = useSearchParams();
  const filters: OutstandingFilters = parseStudentFinanceFilters(
    searchParams,
    { includeSearch: true },
  );

  const { data, isPending, isError, refetch } = useQuery<
    APIResponse<OutstandingResponse>
  >({
    queryKey: ["outstanding-students", filters],
    queryFn: () => fetchOutstandingStudents(filters),
    staleTime: 30000,
  });

  const meta = data?.meta;
  const students = data?.data?.students ?? [];
  const totalOutstandingFees = data?.data?.totalOutstandingFees ?? 0;
  const isEmpty =
    !isPending && !isError && meta !== undefined && meta.total === 0;

  return (
    <AdminPageLayout
      title="Outstanding Fees"
      description="Students with pending fee balances — click any row to open their profile."
      maxWidth="wide"
      action={
        <Link href="/admin/students" className={adminSecondaryButtonClass}>
          All Students
        </Link>
      }
    >
      <StudentFinanceSummary
        isLoading={isPending}
        primaryLabel="Total Outstanding"
        primaryValue={formatSummaryNpr(totalOutstandingFees)}
        primaryHint="Across all students with dues"
        secondaryLabel="Students with Dues"
        secondaryValue={String(meta?.total ?? 0)}
        secondaryHint="Pending clearance"
      />

      <StudentDateFilters isPending={isPending} showSearch />

      <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto max-md:hidden">
              <table className={adminTableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Student</th>
                    <th className={thClass}>Course Fee</th>
                    <th className={thClass}>Paid</th>
                    <th className={thClass}>Discounts</th>
                    <th className={thClass}>Scholarship</th>
                    <th className={thClass}>Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {isPending ? (
                    <StudentTableSkeleton />
                  ) : (
                    students.map((student) => (
                      <StudentTableRow key={student.userId} student={student} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="hidden max-md:block">
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-b border-[rgba(47,78,64,0.1)] p-4 last:border-b-0"
                    >
                      <div className="mb-3 flex gap-3">
                        <div className="h-10 w-10 shrink-0 animate-pulse bg-[rgba(47,78,64,0.08)]" />
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="h-3.5 w-2/5 animate-pulse bg-[rgba(47,78,64,0.08)]" />
                          <div className="h-3 w-3/5 animate-pulse bg-[rgba(47,78,64,0.06)]" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 pl-[52px]">
                        {Array.from({ length: 5 }).map((__, j) => (
                          <div
                            key={j}
                            className="h-3 w-1/2 animate-pulse bg-[rgba(47,78,64,0.06)]"
                          />
                        ))}
                      </div>
                    </div>
                  ))
                : students.map((student) => (
                    <Link
                      href={`/admin/students/${student.studentId}`}
                      key={student.userId}
                      className="block border-b border-[rgba(47,78,64,0.1)] p-4 transition-colors last:border-b-0 hover:bg-[rgba(47,78,64,0.03)]"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <StudentInitialsAvatar name={student.name} />
                        <div>
                          <div className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-ink)">
                            {student.name}
                          </div>
                          <div className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
                            {student.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 pl-[52px]">
                        {[
                          ["Course Fee", student.totalCourseFee],
                          ["Paid", student.totalPaid],
                          ["Discounts", student.totalDiscount],
                          ["Scholarship", student.totalScholarship],
                          ["Outstanding", student.outstanding],
                        ].map(([label, value]) => (
                          <div
                            key={label as string}
                            className="flex items-center justify-between"
                          >
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
                              {label}
                            </span>
                            <span
                              className={`font-[family-name:var(--font-dm-sans)] text-[13px] tabular-nums ${
                                label === "Outstanding"
                                  ? "font-bold text-[#9a3412]"
                                  : "font-medium text-[rgba(47,78,64,0.75)]"
                              }`}
                            >
                              {formatNpr((value as number) / 100)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Link>
                  ))}
            </div>

            {meta && meta.totalPages > 1 ? (
              <div className="border-t border-[rgba(47,78,64,0.12)]">
                <StudentUrlPagination
                  page={filters.page}
                  totalPages={meta.totalPages}
                  isDisabled={isPending}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </AdminPageLayout>
  );
}
