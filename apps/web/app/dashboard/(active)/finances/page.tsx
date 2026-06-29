import { FinancialSummary } from "@/components/student/dashboard/FinancialSummary";
import { PaymentHistory } from "@/components/student/dashboard/PaymentHistory";
import { Discounts } from "@/components/student/dashboard/Discounts";
import { Scholarship } from "@/components/student/dashboard/Scholarship";
import { DashboardPageShell } from "@/components/student/dashboard/DashboardPageShell";
import { dashboardSectionGapClass } from "@/components/student/dashboard/dashboard-styles";

export default function FinancesPage() {
  return (
    <DashboardPageShell
      title="Finances"
      description="Fees, payments, discounts, and scholarship"
    >
      <div className={dashboardSectionGapClass}>
        <FinancialSummary />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
          <Discounts />
          <Scholarship />
        </div>

        <PaymentHistory />
      </div>
    </DashboardPageShell>
  );
}
