import { OverviewCardsSkeleton } from "./OverviewCards";
import { RevenueChartSkeleton } from "./RevenueChart";
import { AdmissionsChartSkeleton } from "./AdmissionsChart";
import { SourceBreakdownSkeleton } from "./SourceBreakdown";
import { StatusBreakdownSkeleton } from "./StatusBreakdown";
import { CoursePopularitySkeleton } from "./CoursePopularity";
import { InquiryStatsSkeleton } from "./InquiryStats";

/**
 * Full-page skeleton that mirrors the exact layout
 * of the analytics dashboard while data is loading.
 */
export function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-7 w-48 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-slate-100" />
        </div>

        {/* Overview cards */}
        <div className="mb-6">
          <OverviewCardsSkeleton />
        </div>

        {/* Charts row 1 */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueChartSkeleton />
          <AdmissionsChartSkeleton />
        </div>

        {/* Charts row 2 */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SourceBreakdownSkeleton />
          <StatusBreakdownSkeleton />
        </div>

        {/* Charts row 3 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CoursePopularitySkeleton />
          <InquiryStatsSkeleton />
        </div>
      </div>
    </div>
  );
}
