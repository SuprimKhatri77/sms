import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { DashboardStatsSkeleton } from "@/modules/admin/dashboard/DashboardStats";
import { RevenueChartSkeleton } from "./RevenueChart";
import { AdmissionsChartSkeleton } from "./AdmissionsChart";
import { SourceBreakdownSkeleton } from "./SourceBreakdown";
import { StatusBreakdownSkeleton } from "./StatusBreakdown";
import { CoursePopularitySkeleton } from "./CoursePopularity";
import { InquiryStatsSkeleton } from "./InquiryStats";
import { AnalyticsGrid, AnalyticsSection } from "./AnalyticsPanel";
import { FISCAL_YEAR } from "../types";

export function AnalyticsSkeleton() {
  return (
    <AdminPageLayout
      title="Analytics"
      description="Overview of your school's performance and metrics"
      maxWidth="wide"
      action={
        <span className="inline-flex items-center border border-[rgba(194,138,79,0.3)] bg-[rgba(194,138,79,0.08)] px-3 py-1.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-(--brand-brown)">
          FY {FISCAL_YEAR}
        </span>
      }
    >
      <div className="space-y-10">
        <section>
          <div className="mb-4">
            <div className="h-5 w-28 animate-pulse bg-[rgba(47,78,64,0.08)]" />
            <div className="mt-2 h-3 w-56 animate-pulse bg-[rgba(47,78,64,0.06)]" />
          </div>
          <DashboardStatsSkeleton />
        </section>

        <AnalyticsSection
          title="Performance"
          description="Revenue trends and monthly admissions"
        >
          <AnalyticsGrid>
            <RevenueChartSkeleton embedded />
            <AdmissionsChartSkeleton embedded />
          </AnalyticsGrid>
        </AnalyticsSection>

        <AnalyticsSection
          title="Breakdown"
          description="Admission sources and application status"
        >
          <AnalyticsGrid>
            <SourceBreakdownSkeleton embedded />
            <StatusBreakdownSkeleton embedded />
          </AnalyticsGrid>
        </AnalyticsSection>

        <AnalyticsSection
          title="Engagement"
          description="Course demand and inquiry activity"
        >
          <AnalyticsGrid>
            <CoursePopularitySkeleton embedded />
            <InquiryStatsSkeleton embedded />
          </AnalyticsGrid>
        </AnalyticsSection>
      </div>
    </AdminPageLayout>
  );
}
