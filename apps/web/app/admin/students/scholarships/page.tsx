export const dynamic = "force-dynamic";

import { Suspense } from "react";
import type { Metadata } from "next";
import { StudentScholarshipsView } from "@/modules/admin/students/scholarships/StudentScholarshipsView";
import { StudentFinanceListPageFallback } from "@/modules/admin/students/shared/StudentFinanceListPageFallback";
import { SCHOLARSHIP_TABLE_COLUMNS } from "@/modules/admin/students/shared/student-finance-table-layout";

export const metadata: Metadata = {
  title: "Student Scholarships | Admin",
  description: "All student scholarships",
};

export default function StudentScholarshipsPage() {
  return (
    <Suspense
      fallback={
        <StudentFinanceListPageFallback
          title="Student Scholarships"
          description="All scholarships awarded across students — filter by date or search by student details."
          columns={SCHOLARSHIP_TABLE_COLUMNS}
        />
      }
    >
      <StudentScholarshipsView />
    </Suspense>
  );
}
