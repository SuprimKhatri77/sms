"use client";

import { Users, Clock, DollarSign, AlertTriangle } from "lucide-react";
import type { OverviewData, RevenueStatsData } from "../types";
import { formatNPR } from "../types";

interface OverviewCardsProps {
  overview: OverviewData;
  revenueStats: RevenueStatsData;
}

interface CardConfig {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export function OverviewCards({ overview, revenueStats }: OverviewCardsProps) {
  const cards: CardConfig[] = [
    {
      label: "Total Students",
      value: overview.totalStudents,
      subtitle: "Enrolled students",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Pending Approvals",
      value: overview.pendingApprovals,
      subtitle: "Awaiting review",
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      label: "Total Revenue",
      value: formatNPR(overview.totalRevenue),
      subtitle: `This month: ${formatNPR(revenueStats.thisMonth)}`,
      icon: DollarSign,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Students with Balance",
      value: overview.studentsWithBalance,
      subtitle: `Outstanding: ${formatNPR(revenueStats.outstanding)}`,
      icon: AlertTriangle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300/70"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[0.8rem] font-medium text-slate-400">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {card.value}
              </p>
              {card.subtitle && (
                <p className="mt-1 text-[0.75rem] text-slate-400">
                  {card.subtitle}
                </p>
              )}
            </div>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg} transition-transform duration-200 group-hover:scale-105`}
            >
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function OverviewCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200/70 bg-white p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
              <div className="mt-3 h-7 w-20 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
