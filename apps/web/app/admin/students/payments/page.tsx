export const dynamic = "force-dynamic";

import { Suspense } from "react";
import type { Metadata } from "next";
import { StudentPaymentsView } from "@/modules/admin/students/payments/StudentPaymentsView";
import { StudentFinanceListPageFallback } from "@/modules/admin/students/shared/StudentFinanceListPageFallback";
import { PAYMENT_TABLE_COLUMNS } from "@/modules/admin/students/shared/student-finance-table-layout";

export const metadata: Metadata = {
  title: "Student Payments | Admin",
  description: "All student fee payments",
};

export default function StudentPaymentsPage() {
  return (
    <Suspense
      fallback={
        <StudentFinanceListPageFallback
          title="Student Payments"
          description="All fee payments across students — filter by date or search by name, email, or reference."
          columns={PAYMENT_TABLE_COLUMNS}
        />
      }
    >
      <StudentPaymentsView />
    </Suspense>
  );
}
