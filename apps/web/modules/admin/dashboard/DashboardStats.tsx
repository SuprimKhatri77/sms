"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";

import type { OverviewData, RevenueStatsData } from "@/modules/admin/analytics/types";
import { formatNPR } from "@/modules/admin/analytics/types";

type DashboardStatsProps = {
  overview: OverviewData;
  revenueStats: RevenueStatsData;
};

const statCards = (
  overview: OverviewData,
  revenueStats: RevenueStatsData,
) => [
  {
    label: "Total Students",
    value: overview.totalStudents.toLocaleString(),
    detail: "Currently enrolled",
    href: "/admin/students",
    icon: Users,
  },
  {
    label: "Pending Approvals",
    value: overview.pendingApprovals.toLocaleString(),
    detail: "Awaiting review",
    href: "/admin/students?status=pending",
    icon: Clock,
  },
  {
    label: "Total Revenue",
    value: formatNPR(overview.totalRevenue),
    detail: `This month ${formatNPR(revenueStats.thisMonth)}`,
    href: "/admin/students/sales",
    icon: DollarSign,
  },
  {
    label: "Outstanding",
    value: overview.studentsWithBalance.toLocaleString(),
    detail: formatNPR(revenueStats.outstanding),
    href: "/admin/students/outstanding",
    icon: AlertTriangle,
  },
];

export function DashboardStats({ overview, revenueStats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 divide-y divide-[rgba(47,78,64,0.12)] border border-[rgba(47,78,64,0.18)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
      {statCards(overview, revenueStats).map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="group relative bg-white p-5 transition-colors hover:bg-[rgba(47,78,64,0.02)]"
        >
          <span className="absolute top-0 left-0 h-[2px] w-0 bg-(--brand-brown) transition-all duration-300 group-hover:w-full" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.45)]">
                {card.label}
              </p>
              <p className="mt-2 font-[family-name:var(--font-lora)] text-2xl font-bold tracking-tight text-(--brand-ink)">
                {card.value}
              </p>
              <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
                {card.detail}
              </p>
            </div>
            <card.icon className="mt-0.5 h-4 w-4 shrink-0 text-[rgba(47,78,64,0.35)] transition-colors group-hover:text-(--brand-brown)" />
          </div>
        </Link>
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 divide-y divide-[rgba(47,78,64,0.12)] border border-[rgba(47,78,64,0.18)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white p-5">
          <div className="h-3 w-20 animate-pulse bg-[rgba(47,78,64,0.08)]" />
          <div className="mt-3 h-8 w-24 animate-pulse bg-[rgba(47,78,64,0.08)]" />
          <div className="mt-2 h-3 w-32 animate-pulse bg-[rgba(47,78,64,0.06)]" />
        </div>
      ))}
    </div>
  );
}
