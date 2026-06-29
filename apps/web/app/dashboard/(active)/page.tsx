import { StudentHero } from "@/components/student/dashboard/StudentHero";
import { FinancialSummary } from "@/components/student/dashboard/FinancialSummary";
import { DashboardQuickLinks } from "@/components/student/dashboard/DashboardQuickLinks";
import { DashboardPageShell } from "@/components/student/dashboard/DashboardPageShell";
import { dashboardSectionGapClass } from "@/components/student/dashboard/dashboard-styles";

export default function DashboardPage() {
  return (
    <DashboardPageShell
      title="Overview"
      description="Your profile and a snapshot of your account"
    >
      <div className={dashboardSectionGapClass}>
        <StudentHero />
        <FinancialSummary />
        <DashboardQuickLinks />
      </div>
    </DashboardPageShell>
  );
}
