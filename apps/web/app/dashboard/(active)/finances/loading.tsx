import { DashboardLoadingShell } from "@/components/student/dashboard/DashboardLoadingShell";
import { dashboardSectionGapClass } from "@/components/student/dashboard/dashboard-styles";
import { cn } from "@/lib/utils";

function S({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-[rgba(47,78,64,0.08)]", className)}
    />
  );
}

export default function Loading() {
  return (
    <DashboardLoadingShell>
      <div className={dashboardSectionGapClass}>
        <div className="space-y-4">
          <S className="h-5 w-40" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <S key={i} className="h-[108px]" />
            ))}
          </div>
          <S className="h-1.5 w-full" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
          <S className="h-[88px]" />
          <S className="h-[120px]" />
        </div>

        <div className="space-y-4">
          <S className="h-5 w-36" />
          <div className="overflow-hidden border border-[rgba(47,78,64,0.1)] bg-white divide-y divide-[rgba(47,78,64,0.06)]">
            {Array.from({ length: 3 }).map((_, i) => (
              <S key={i} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
