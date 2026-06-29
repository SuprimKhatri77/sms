import { DashboardLoadingShell } from "@/components/student/dashboard/DashboardLoadingShell";
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
      <div className="space-y-4">
        <S className="h-5 w-36" />
        <S className="h-[72px]" />
        <S className="h-[72px]" />
      </div>
    </DashboardLoadingShell>
  );
}
