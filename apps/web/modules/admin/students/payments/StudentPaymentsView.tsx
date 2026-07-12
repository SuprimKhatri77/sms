"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { PaymentTableRow } from "./PaymentTableRow";
import { useStudentPaymentsList } from "@/hooks/queries/admin/students/useStudentPaymentsList";
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
import { formatFinanceDate } from "../shared/student-finance-list-utils";
import { parseStudentFinanceFilters } from "../shared/student-date-filter-utils";
import { formatNpr } from "../shared/student-utils";
import { adminSecondaryButtonClass } from "@/components/admin/admin-styles";
import { useAdminRefreshShortcut } from "@/components/admin/admin-shortcut-provider";
import { useAdminQueryRefresh } from "@/hooks/useAdminQueryRefresh";
import {
  FinanceTableColGroup,
  FinanceTableHead,
  financeTableClass,
  PAYMENT_TABLE_COLUMNS,
} from "../shared/student-finance-table-layout";

export function StudentPaymentsView() {
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
    useStudentPaymentsList(listFilters);

  useAdminRefreshShortcut(useAdminQueryRefresh(refetch));

  const meta = data?.meta;
  const payments = data?.data?.payments ?? [];
  const totalPayments = data?.data?.totalPayments ?? 0;
  const isEmpty =
    !isPending && !isError && meta !== undefined && meta.total === 0;

  return (
    <AdminPageLayout
      title="Student Payments"
      description="All fee payments across students — filter by date or search by name, email, or reference."
      maxWidth="wide"
      action={
        <Link href="/admin/students" className={adminSecondaryButtonClass}>
          All Students
        </Link>
      }
    >
      <StudentFinanceSummary
        isLoading={isPending}
        primaryLabel="Total Collected"
        primaryValue={formatSummaryNpr(totalPayments)}
        primaryHint="Sum of payments in this view"
        secondaryLabel="Payment Records"
        secondaryValue={String(meta?.total ?? 0)}
        secondaryHint="Matching current filters"
      />

      <StudentDateFilters isPending={isPending} showSearch />

      <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
        <div className="overflow-x-auto max-md:hidden">
          <table className={financeTableClass}>
            <FinanceTableColGroup columns={PAYMENT_TABLE_COLUMNS} />
            <FinanceTableHead columns={PAYMENT_TABLE_COLUMNS} />
            <tbody>
              {isPending ? (
                <StudentFinanceTableSkeleton columns={PAYMENT_TABLE_COLUMNS} />
              ) : isError ? (
                <tr>
                  <td colSpan={PAYMENT_TABLE_COLUMNS.length} className="p-0">
                    <StudentFinanceListError
                      description="We couldn't load payments. Check your connection and try again."
                      onRetry={() => refetch()}
                    />
                  </td>
                </tr>
              ) : isEmpty ? (
                <tr>
                  <td colSpan={PAYMENT_TABLE_COLUMNS.length} className="p-0">
                    <StudentFinanceListEmpty
                      title="No payments found"
                      description="Try adjusting the date range or search term, or clear filters to see all records."
                    />
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <PaymentTableRow key={payment.paymentId} payment={payment} />
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
              description="We couldn't load payments. Check your connection and try again."
              onRetry={() => refetch()}
            />
          ) : isEmpty ? (
            <StudentFinanceListEmpty
              title="No payments found"
              description="Try adjusting the date range or search term, or clear filters to see all records."
            />
          ) : (
            payments.map((payment) => (
              <Link
                key={payment.paymentId}
                href={`/admin/students/${payment.studentId}`}
                className="block border-b border-[rgba(47,78,64,0.1)] p-4 transition-colors last:border-b-0 hover:bg-[rgba(47,78,64,0.03)]"
              >
                <div className="mb-3">
                  <StudentFinanceStudentCell
                    fullName={payment.fullName}
                    email={payment.email}
                    referenceNo={payment.referenceNo}
                  />
                </div>
                <div className="flex flex-col gap-1.5 pl-[52px]">
                  {[
                    ["Amount", formatNpr(payment.amount / 100)],
                    ["Mode", payment.paymentMode],
                    ["Remarks", payment.remarks?.trim() || "—"],
                    ["Date", formatFinanceDate(payment.addedAt)],
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
