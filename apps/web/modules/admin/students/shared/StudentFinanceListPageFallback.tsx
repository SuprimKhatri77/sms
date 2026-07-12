import Link from "next/link";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { StudentDateFilters } from "./StudentDateFilters";
import { StudentFinanceSummary } from "./StudentFinanceSummary";
import {
  StudentFinanceMobileSkeleton,
  StudentFinanceTableSkeleton,
} from "./StudentFinanceTableSkeleton";
import {
  FinanceTableColGroup,
  FinanceTableHead,
  financeTableClass,
  type FinanceTableColumn,
} from "./student-finance-table-layout";
import { adminSecondaryButtonClass } from "@/components/admin/admin-styles";

type StudentFinanceListPageFallbackProps = {
  title: string;
  description: string;
  columns: FinanceTableColumn[];
  showSearch?: boolean;
};

export function StudentFinanceListPageFallback({
  title,
  description,
  columns,
  showSearch = true,
}: StudentFinanceListPageFallbackProps) {
  return (
    <AdminPageLayout
      title={title}
      description={description}
      maxWidth="wide"
      action={
        <Link href="/admin/students" className={adminSecondaryButtonClass}>
          All Students
        </Link>
      }
    >
      <StudentFinanceSummary
        isLoading
        primaryLabel="Loading"
        primaryValue=""
        primaryHint="Fetching summary"
        secondaryLabel="Records"
        secondaryValue=""
        secondaryHint="Please wait"
      />

      <StudentDateFilters isPending showSearch={showSearch} />

      <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
        <div className="overflow-x-auto max-md:hidden">
          <table className={financeTableClass}>
            <FinanceTableColGroup columns={columns} />
            <FinanceTableHead columns={columns} />
            <tbody>
              <StudentFinanceTableSkeleton columns={columns} />
            </tbody>
          </table>
        </div>
        <div className="hidden max-md:block">
          <StudentFinanceMobileSkeleton />
        </div>
      </div>
    </AdminPageLayout>
  );
}
