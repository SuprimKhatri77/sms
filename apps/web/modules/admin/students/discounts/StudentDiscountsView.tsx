"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { DiscountTableRow } from "./DiscountTableRow";
import { useStudentDiscountsList } from "@/hooks/queries/admin/students/useStudentDiscountsList";
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
  DISCOUNT_TABLE_COLUMNS,
  FinanceTableColGroup,
  FinanceTableHead,
  financeTableClass,
} from "../shared/student-finance-table-layout";

function formatDiscountType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export function StudentDiscountsView() {
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
    useStudentDiscountsList(listFilters);

  useAdminRefreshShortcut(useAdminQueryRefresh(refetch));

  const meta = data?.meta;
  const discounts = data?.data?.discounts ?? [];
  const totalDiscounts = data?.data?.totalDiscounts ?? 0;
  const isEmpty =
    !isPending && !isError && meta !== undefined && meta.total === 0;

  return (
    <AdminPageLayout
      title="Student Discounts"
      description="All discounts applied across students — filter by date or search by student details."
      maxWidth="wide"
      action={
        <Link href="/admin/students" className={adminSecondaryButtonClass}>
          All Students
        </Link>
      }
    >
      <StudentFinanceSummary
        isLoading={isPending}
        primaryLabel="Total Discounted"
        primaryValue={formatSummaryNpr(totalDiscounts)}
        primaryHint="Sum of discount amounts in this view"
        secondaryLabel="Discount Records"
        secondaryValue={String(meta?.total ?? 0)}
        secondaryHint="Matching current filters"
      />

      <StudentDateFilters isPending={isPending} showSearch />

      <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
        <div className="overflow-x-auto max-md:hidden">
          <table className={financeTableClass}>
            <FinanceTableColGroup columns={DISCOUNT_TABLE_COLUMNS} />
            <FinanceTableHead columns={DISCOUNT_TABLE_COLUMNS} />
            <tbody>
              {isPending ? (
                <StudentFinanceTableSkeleton columns={DISCOUNT_TABLE_COLUMNS} />
              ) : isError ? (
                <tr>
                  <td colSpan={DISCOUNT_TABLE_COLUMNS.length} className="p-0">
                    <StudentFinanceListError
                      description="We couldn't load discounts. Check your connection and try again."
                      onRetry={() => refetch()}
                    />
                  </td>
                </tr>
              ) : isEmpty ? (
                <tr>
                  <td colSpan={DISCOUNT_TABLE_COLUMNS.length} className="p-0">
                    <StudentFinanceListEmpty
                      title="No discounts found"
                      description="Try adjusting the date range or search term, or clear filters to see all records."
                    />
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <DiscountTableRow key={discount.discountId} discount={discount} />
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
              description="We couldn't load discounts. Check your connection and try again."
              onRetry={() => refetch()}
            />
          ) : isEmpty ? (
            <StudentFinanceListEmpty
              title="No discounts found"
              description="Try adjusting the date range or search term, or clear filters to see all records."
            />
          ) : (
            discounts.map((discount) => (
              <Link
                key={discount.discountId}
                href={`/admin/students/${discount.studentId}`}
                className="block border-b border-[rgba(47,78,64,0.1)] p-4 transition-colors last:border-b-0 hover:bg-[rgba(47,78,64,0.03)]"
              >
                <div className="mb-3">
                  <StudentFinanceStudentCell
                    fullName={discount.fullName}
                    email={discount.email}
                    referenceNo={discount.referenceNo}
                  />
                </div>
                <div className="flex flex-col gap-1.5 pl-[52px]">
                  {[
                    ["Type", formatDiscountType(discount.type)],
                    ["Percent", formatFinancePercent(discount.percent)],
                    ["Amount", formatNpr(discount.amount / 100)],
                    ["Note", discount.note?.trim() || "—"],
                    ["Date", formatFinanceDate(discount.createdAt)],
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
