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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <RefreshCw className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          Failed to load analytics
        </h3>
        <p className="mt-1 text-[0.85rem] text-slate-400">
          Something went wrong while fetching the data.
        </p>
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-[0.85rem] font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
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

  if (isError || !data) {
    return <AnalyticsError onRetry={() => refetch()} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Analytics
            </h1>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-[0.75rem] font-medium text-blue-600">
              FY {FISCAL_YEAR}
            </span>
          </div>
          <p className="mt-1 text-[0.85rem] text-slate-400">
            Overview of your school&apos;s performance and metrics
          </p>
        </div>

        {/* Overview cards */}
        <div className="mb-6">
          <OverviewCards
            overview={data.overview}
            revenueStats={data.revenueStats}
          />
        </div>

        {/* Charts row 1: Revenue + Admissions */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueChart
            data={data.monthlyRevenue}
            revenueStats={data.revenueStats}
          />
          <AdmissionsChart data={data.monthlyAdmissions} />
        </div>

        {/* Charts row 2: Sources + Status */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SourceBreakdown data={data.sourceBreakdown} />
          <StatusBreakdown data={data.statusBreakdown} />
        </div>

        {/* Charts row 3: Courses + Inquiries */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CoursePopularity data={data.coursePopularity} />
          <InquiryStats data={data.inquiries} />
        </div>
      </div>
    </div>
  );
}
