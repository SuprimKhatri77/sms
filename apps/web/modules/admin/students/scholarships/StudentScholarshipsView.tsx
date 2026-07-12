"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { ScholarshipTableRow } from "./ScholarshipTableRow";
import { useStudentScholarshipsList } from "@/hooks/queries/admin/students/useStudentScholarshipsList";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  StudentFinanceSummary,
  formatSummaryNpr,
} from "../shared/StudentFinanceSummary";
import { StudentDateFilters } from "../shared/StudentDateFilters";
import { StudentUrlPagination } from "../shared/StudentUrlPagination";
import { StudentFinanceStudentCell } from "../shared/StudentFinanceStudentCell";
import {
  StudentFinanceListEmpty,
  StudentFinanceListError,
} from "../shared/StudentFinanceListStates";
import {
  StudentFinanceMobileSkeleton,
  StudentFinanceTableSkeleton,
} from "../shared/StudentFinanceTableSkeleton";
import {
  formatFinanceDate,
  formatFinancePercent,
} from "../shared/student-finance-list-utils";
import { parseStudentFinanceFilters } from "../shared/student-date-filter-utils";
import { formatNpr } from "../shared/student-utils";
import { adminSecondaryButtonClass } from "@/components/admin/admin-styles";
import { useAdminRefreshShortcut } from "@/components/admin/admin-shortcut-provider";
import { useAdminQueryRefresh } from "@/hooks/useAdminQueryRefresh";

import {
  FinanceTableColGroup,
  FinanceTableHead,
  financeTableClass,
  SCHOLARSHIP_TABLE_COLUMNS,
} from "../shared/student-finance-table-layout";

export function StudentScholarshipsView() {
  const searchParams = useSearchParams();
  const urlFilters = parseStudentFinanceFilters(searchParams, {
    includeSearch: true,
  });
  const listFilters = {
    page: urlFilters.page,
    from: urlFilters.from,
    to: urlFilters.to,
    search: urlFilters.search,
  };

  const { data, isPending, isError, refetch } =
    useStudentScholarshipsList(listFilters);

  useAdminRefreshShortcut(useAdminQueryRefresh(refetch));

  const meta = data?.meta;
  const scholarships = data?.data?.scholarships ?? [];
  const totalScholarships = data?.data?.totalScholarships ?? 0;
  const isEmpty =
    !isPending && !isError && meta !== undefined && meta.total === 0;

  return (
    <AdminPageLayout
      title="Student Scholarships"
      description="All scholarships awarded across students — filter by date or search by student details."
      maxWidth="wide"
      action={
        <Link href="/admin/students" className={adminSecondaryButtonClass}>
          All Students
        </Link>
      }
    >
      <StudentFinanceSummary
        isLoading={isPending}
        primaryLabel="Total Scholarship"
        primaryValue={formatSummaryNpr(totalScholarships)}
        primaryHint="Sum of scholarship amounts in this view"
        secondaryLabel="Scholarship Records"
        secondaryValue={String(meta?.total ?? 0)}
        secondaryHint="Matching current filters"
      />

      <StudentDateFilters isPending={isPending} showSearch />

      <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
        <div className="overflow-x-auto max-md:hidden">
          <table className={financeTableClass}>
            <FinanceTableColGroup columns={SCHOLARSHIP_TABLE_COLUMNS} />
            <FinanceTableHead columns={SCHOLARSHIP_TABLE_COLUMNS} />
            <tbody>
              {isPending ? (
                <StudentFinanceTableSkeleton columns={SCHOLARSHIP_TABLE_COLUMNS} />
              ) : isError ? (
                <tr>
                  <td colSpan={SCHOLARSHIP_TABLE_COLUMNS.length} className="p-0">
                    <StudentFinanceListError
                      description="We couldn't load scholarships. Check your connection and try again."
                      onRetry={() => refetch()}
                    />
                  </td>
                </tr>
              ) : isEmpty ? (
                <tr>
                  <td colSpan={SCHOLARSHIP_TABLE_COLUMNS.length} className="p-0">
                    <StudentFinanceListEmpty
                      title="No scholarships found"
                      description="Try adjusting the date range or search term, or clear filters to see all records."
                    />
                  </td>
                </tr>
              ) : (
                scholarships.map((scholarship) => (
                  <ScholarshipTableRow
                    key={scholarship.scholarshipId}
                    scholarship={scholarship}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="hidden max-md:block">
          {isPending ? (
            <StudentFinanceMobileSkeleton />
          ) : isError ? (
            <StudentFinanceListError
              description="We couldn't load scholarships. Check your connection and try again."
              onRetry={() => refetch()}
            />
          ) : isEmpty ? (
            <StudentFinanceListEmpty
              title="No scholarships found"
              description="Try adjusting the date range or search term, or clear filters to see all records."
            />
          ) : (
            scholarships.map((scholarship) => (
              <Link
                key={scholarship.scholarshipId}
                href={`/admin/students/${scholarship.studentId}`}
                className="block border-b border-[rgba(47,78,64,0.1)] p-4 transition-colors last:border-b-0 hover:bg-[rgba(47,78,64,0.03)]"
              >
                <div className="mb-3">
                  <StudentFinanceStudentCell
                    fullName={scholarship.fullName}
                    email={scholarship.email}
                    referenceNo={scholarship.referenceNo}
                  />
                </div>
                <div className="flex flex-col gap-1.5 pl-[52px]">
                  {[
                    ["Percent", formatFinancePercent(scholarship.percent)],
                    ["Amount", formatNpr(scholarship.amount / 100)],
                    ["Note", scholarship.note?.trim() || "—"],
                    ["Date", formatFinanceDate(scholarship.createdAt)],
                  ].map(([label, value]) => (
                    <div
                      key={label as string}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.5)]">
                        {label}
                      </span>
                      <span className="text-right font-(family-name:--font-dm-sans) text-[13px] font-medium text-[rgba(47,78,64,0.75)]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>

        {meta && meta.totalPages > 1 && !isError ? (
          <div className="border-t border-[rgba(47,78,64,0.12)]">
            <StudentUrlPagination
              page={urlFilters.page}
              totalPages={meta.totalPages}
              isDisabled={isPending}
            />
          </div>
        ) : null}
      </div>
    </AdminPageLayout>
  );
}
