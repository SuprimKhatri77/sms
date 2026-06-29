"use client";

import { TrendingUp, CreditCard, AlertCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { GetStudentFeeSummaryResponse } from "@repo/types";
import { cn } from "@/lib/utils";
import { DashboardSection } from "./DashboardSection";
import {
  dashboardCardClass,
  dashboardInsetClass,
  dashboardLabelClass,
  dashboardMoneyClass,
  dashboardPrimaryBtnClass,
} from "./dashboard-styles";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: "green" | "brown" | "muted";
}

function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  const accentMap = {
    green: {
      border: "border-[rgba(47,78,64,0.14)]",
      iconBg: "bg-[rgba(47,78,64,0.08)]",
      iconColor: "text-(--brand-green)",
      valueColor: "text-(--brand-green)",
    },
    brown: {
      border: "border-[rgba(194,138,79,0.2)]",
      iconBg: "bg-[rgba(194,138,79,0.1)]",
      iconColor: "text-(--brand-brown)",
      valueColor: "text-(--brand-brown)",
    },
    muted: {
      border: "border-[rgba(47,78,64,0.1)]",
      iconBg: "bg-[rgba(47,78,64,0.05)]",
      iconColor: "text-[rgba(47,78,64,0.45)]",
      valueColor: "text-(--brand-green)",
    },
  } as const;

  const styles = accentMap[accent];

  return (
    <div
      className={cn(
        dashboardInsetClass,
        "p-5 transition-colors duration-200",
        styles.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={dashboardLabelClass}>{label}</p>
          <p
            className={cn(
              "mt-2 text-[1.35rem] leading-none",
              dashboardMoneyClass,
              styles.valueColor,
            )}
          >
            {value}
          </p>
          {sub ? (
            <p className="mt-2 font-[family-name:var(--font-dm-sans)] text-[0.75rem] font-medium text-[rgba(47,78,64,0.42)]">
              {sub}
            </p>
          ) : null}
        </div>
        <div className={cn("shrink-0 p-2.5", styles.iconBg)}>
          <span className={styles.iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function formatNPR(amount: number): string {
  return `NPR ${(amount / 100).toLocaleString("en-NP")}`;
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-[rgba(47,78,64,0.08)]", className)} />
  );
}

function FinancialSummarySkeleton() {
  return (
    <DashboardSection title="Financial overview">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} className="h-[108px]" />
        ))}
      </div>
      <div className="space-y-2 pt-1">
        <div className="flex justify-between">
          <Shimmer className="h-3 w-28" />
          <Shimmer className="h-3 w-8" />
        </div>
        <Shimmer className="h-1.5 w-full" />
      </div>
    </DashboardSection>
  );
}

function FinancialSummaryError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <DashboardSection title="Financial overview">
      <div
        className={cn(
          dashboardCardClass,
          "flex flex-col items-center gap-3 px-5 py-8 text-center",
        )}
      >
        <AlertCircle className="h-5 w-5 text-red-400" strokeWidth={1.75} />
        <div>
          <p className="font-[family-name:var(--font-dm-sans)] text-[0.9rem] font-semibold text-(--brand-green)">
            Couldn&apos;t load financial data
          </p>
          <p className="mx-auto mt-1 max-w-xs font-[family-name:var(--font-dm-sans)] text-[0.8rem] leading-relaxed text-[rgba(47,78,64,0.5)]">
            {message ?? "Something went wrong fetching your fee summary."}
          </p>
        </div>
        <button type="button" onClick={onRetry} className={dashboardPrimaryBtnClass}>
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
          Try again
        </button>
      </div>
    </DashboardSection>
  );
}

export function FinancialSummary() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["student-fee-summary"],
    queryFn: async () => {
      const res = await api.get<GetStudentFeeSummaryResponse>(
        "/portal/student/fee/summary",
      );
      const parsed = res.data;

      if (!parsed.success) {
        throw new Error(parsed.message ?? "Failed to load fee summary");
      }

      return parsed.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });

  if (isPending) return <FinancialSummarySkeleton />;

  if (isError) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return <FinancialSummaryError message={message} onRetry={refetch} />;
  }

  const { totalFee, totalPaid, remaining, coursesCount } = data;
  const paidPercent =
    totalFee > 0 ? Math.min((totalPaid / totalFee) * 100, 100) : 0;

  return (
    <DashboardSection title="Financial overview">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total fee"
          value={formatNPR(totalFee)}
          sub={`${coursesCount} course${coursesCount !== 1 ? "s" : ""}`}
          icon={<CreditCard size={18} strokeWidth={1.75} />}
          accent="muted"
        />
        <StatCard
          label="Total paid"
          value={formatNPR(totalPaid)}
          sub={`${Math.round(paidPercent)}% of total fee`}
          icon={<TrendingUp size={18} strokeWidth={1.75} />}
          accent="green"
        />
        <StatCard
          label="Remaining balance"
          value={formatNPR(remaining)}
          sub={remaining === 0 ? "Fully cleared" : "Outstanding"}
          icon={<AlertCircle size={18} strokeWidth={1.75} />}
          accent={remaining === 0 ? "green" : "brown"}
        />
      </div>

      <div className="pt-1">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-[family-name:var(--font-dm-sans)] text-[0.75rem] font-medium text-[rgba(47,78,64,0.45)]">
            Payment progress
          </span>
          <span className="font-[family-name:var(--font-dm-sans)] text-[0.75rem] font-semibold text-(--brand-green)">
            {Math.round(paidPercent)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden bg-[rgba(47,78,64,0.08)]">
          <div
            className="h-full bg-(--brand-green) transition-all duration-700 ease-out"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
      </div>
    </DashboardSection>
  );
}
