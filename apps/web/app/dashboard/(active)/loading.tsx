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
        <div className="overflow-hidden border border-[rgba(47,78,64,0.1)] bg-white">
          <div className="border-b border-[rgba(47,78,64,0.08)] bg-[#faf9f6] p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <S className="h-20 w-20 shrink-0 sm:h-[88px] sm:w-[88px]" />
              <div className="flex-1 space-y-3">
                <S className="h-3 w-24" />
                <S className="h-8 w-52" />
                <S className="h-6 w-20" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <S key={i} className="h-20" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <S className="h-5 w-40" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <S key={i} className="h-[108px]" />
            ))}
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between">
              <S className="h-3 w-28" />
              <S className="h-3 w-8" />
            </div>
            <S className="h-1.5 w-full" />
          </div>
        </div>

        <div className="space-y-4">
          <S className="h-5 w-28" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <S key={i} className="h-28" />
            ))}
          </div>
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
