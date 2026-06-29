import { cn } from "@/lib/utils";
import {
  dashboardBadgeClass,
  dashboardSectionTitleClass,
} from "./dashboard-styles";

export function DashboardSection({
  title,
  badge,
  children,
  className,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={dashboardSectionTitleClass}>{title}</h2>
        {badge ? (
          <span
            className={cn(
              dashboardBadgeClass,
              "border border-[rgba(47,78,64,0.1)] bg-[#f4f1ec] px-2.5 py-1 text-[rgba(47,78,64,0.55)]",
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
