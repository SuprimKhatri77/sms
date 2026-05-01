"use client";

import { RefreshCw } from "lucide-react";
import { useAnalytics } from "./hooks/useAnalytics";
import { FISCAL_YEAR } from "./types";

import { OverviewCards } from "./components/OverviewCards";
import { RevenueChart } from "./components/RevenueChart";
import { AdmissionsChart } from "./components/AdmissionsChart";
import { SourceBreakdown } from "./components/SourceBreakdown";
import { StatusBreakdown } from "./components/StatusBreakdown";
import { CoursePopularity } from "./components/CoursePopularity";
import { InquiryStats } from "./components/InquiryStats";
import { AnalyticsSkeleton } from "./components/AnalyticsSkeleton";

// ─── Error State ──────────────────────────────────────────────────────────────

function AnalyticsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(194,138,79,0.14)]">
          <RefreshCw className="h-6 w-6 text-(--brand-brown)" />
        </div>
        <h3 className="text-lg font-semibold text-(--brand-green)">
          Failed to load analytics
        </h3>
        <p className="mt-1 text-[0.85rem] text-[rgba(47,78,64,0.55)]">
          Something went wrong while fetching the data.
        </p>
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-(--brand-green) px-5 py-2.5 text-[0.85rem] font-medium text-white transition-colors hover:bg-(--brand-green-2)"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
    <div className="min-h-screen bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-(--brand-green)">
              Analytics
            </h1>
            <span className="inline-flex items-center rounded-md bg-[rgba(194,138,79,0.14)] px-2.5 py-1 text-[0.75rem] font-medium text-(--brand-brown)">
              FY {FISCAL_YEAR}
            </span>
          </div>
          <p className="mt-1 text-[0.85rem] text-[rgba(47,78,64,0.55)]">
            Overview of your school&apos;s performance and metrics
          </p>
        </div>

        {/* Overview cards */}
        <div className="mb-6">
          <OverviewCards overview={overview} revenueStats={revenueStats} />
        </div>

        {/* Charts row 1: Revenue + Admissions */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueChart data={monthlyRevenue} revenueStats={revenueStats} />
          <AdmissionsChart data={monthlyAdmissions} />
        </div>

        {/* Charts row 2: Sources + Status */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SourceBreakdown data={sourceBreakdown} />
          <StatusBreakdown data={statusBreakdown} />
        </div>

        {/* Charts row 3: Courses + Inquiries */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CoursePopularity data={coursePopularity} />
          <InquiryStats
            data={{
              total: inquiryStats.total,
              unread: inquiryStats.unread,
              monthlyInquiries,
            }}
          />
        </div>
      </div>
    </div>
  );
}
