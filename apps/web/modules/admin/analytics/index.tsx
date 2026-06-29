"use client";

import { RefreshCw } from "lucide-react";
import { useAnalytics } from "./hooks/useAnalytics";
import { FISCAL_YEAR } from "./types";

import { RevenueChart } from "./components/RevenueChart";
import { AdmissionsChart } from "./components/AdmissionsChart";
import { SourceBreakdown } from "./components/SourceBreakdown";
import { StatusBreakdown } from "./components/StatusBreakdown";
import { CoursePopularity } from "./components/CoursePopularity";
import { InquiryStats } from "./components/InquiryStats";
import { AnalyticsSkeleton } from "./components/AnalyticsSkeleton";
import {
  AnalyticsGrid,
  AnalyticsSection,
} from "./components/AnalyticsPanel";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  DashboardStats,
  DashboardStatsSkeleton,
} from "@/modules/admin/dashboard/DashboardStats";

function AnalyticsError({ onRetry }: { onRetry: () => void }) {
  return (
    <AdminPageLayout
      title="Analytics"
      description="Overview of your school's performance and metrics"
      maxWidth="wide"
    >
      <div className="flex min-h-[50vh] items-center justify-center border border-[rgba(47,78,64,0.18)] bg-white px-6 py-16">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-[rgba(194,138,79,0.25)] bg-[rgba(194,138,79,0.08)]">
            <RefreshCw className="h-6 w-6 text-(--brand-brown)" />
          </div>
          <h3 className="font-[family-name:var(--font-lora)] text-lg font-bold text-(--brand-green)">
            Failed to load analytics
          </h3>
          <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
            Something went wrong while fetching the data.
          </p>
          <button
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 border border-(--brand-green) bg-(--brand-green) px-5 py-2.5 font-[family-name:var(--font-dm-sans)] text-sm font-medium text-white transition-colors hover:bg-(--brand-green-2)"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    </AdminPageLayout>
  );
}

export default function AnalyticsPage() {
  const { data, isPending, isError, refetch } = useAnalytics();

  if (isPending) {
    return <AnalyticsSkeleton />;
  }

  if (isError || !data || !data.success) {
    return <AnalyticsError onRetry={() => refetch()} />;
  }

  const {
    overview,
    revenueStats,
    monthlyAdmissions,
    monthlyRevenue,
    monthlyInquiries,
    coursePopularity,
    inquiryStats,
    sourceBreakdown,
    statusBreakdown,
  } = data.data;

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
            <h2 className="font-[family-name:var(--font-lora)] text-lg font-bold text-(--brand-green)">
              Key metrics
            </h2>
            <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
              Snapshot of enrollment, revenue, and outstanding balances
            </p>
          </div>
          <DashboardStats overview={overview} revenueStats={revenueStats} />
        </section>

        <AnalyticsSection
          title="Performance"
          description="Revenue trends and monthly admissions"
        >
          <AnalyticsGrid>
            <RevenueChart
              embedded
              data={monthlyRevenue}
              revenueStats={revenueStats}
            />
            <AdmissionsChart embedded data={monthlyAdmissions} />
          </AnalyticsGrid>
        </AnalyticsSection>

        <AnalyticsSection
          title="Breakdown"
          description="Admission sources and application status"
        >
          <AnalyticsGrid>
            <SourceBreakdown embedded data={sourceBreakdown} />
            <StatusBreakdown embedded data={statusBreakdown} />
          </AnalyticsGrid>
        </AnalyticsSection>

        <AnalyticsSection
          title="Engagement"
          description="Course demand and inquiry activity"
        >
          <AnalyticsGrid>
            <CoursePopularity embedded data={coursePopularity} />
            <InquiryStats
              embedded
              data={{
                total: inquiryStats.total,
                unread: inquiryStats.unread,
                monthlyInquiries,
              }}
            />
          </AnalyticsGrid>
        </AnalyticsSection>
      </div>
    </AdminPageLayout>
  );
}
