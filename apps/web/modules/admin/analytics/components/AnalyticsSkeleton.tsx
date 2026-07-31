import type { ReactNode } from "react";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { DashboardStatsSkeleton } from "@/modules/admin/dashboard/DashboardStats";
import { RevenueChartSkeleton } from "./RevenueChart";
import { AdmissionsChartSkeleton } from "./AdmissionsChart";
import { SourceBreakdownSkeleton } from "./SourceBreakdown";
import { StatusBreakdownSkeleton } from "./StatusBreakdown";
import { CoursePopularitySkeleton } from "./CoursePopularity";
import { InquiryStatsSkeleton } from "./InquiryStats";
import { AnalyticsGrid, AnalyticsSection } from "./AnalyticsPanel";
import { FiscalYearFilter } from "./FiscalYearFilter";
import { FISCAL_YEAR_ALL } from "../fiscal-year";

type AnalyticsSkeletonProps = {
  action?: ReactNode;
};

export function AnalyticsSkeleton({ action }: AnalyticsSkeletonProps) {
  return (
    <AdminPageLayout
      title="Analytics"
      description="Overview of your school's performance and metrics"
      maxWidth="wide"
      action={
        action ?? (
          <FiscalYearFilter
            value={FISCAL_YEAR_ALL}
            onChange={() => {}}
            disabled
          />
        )
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
