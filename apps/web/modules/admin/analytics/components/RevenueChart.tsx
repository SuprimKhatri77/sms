"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyRevenue, RevenueStatsData } from "../types";
import { formatNPR, CHART_COLORS, PAISA_TO_RUPEES } from "../types";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { AnalyticsEmptyState } from "./AnalyticsEmptyState";
import { hasRevenueData } from "./analytics-empty";
import { IndianRupee } from "lucide-react";
import {
  ANALYTICS_GRID_STROKE,
  ANALYTICS_TICK_FILL,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
} from "./analytics-styles";

interface RevenueChartProps {
  data: MonthlyRevenue[];
  revenueStats: RevenueStatsData;
  embedded?: boolean;
}

export function RevenueChart({
  data,
  revenueStats,
  embedded = false,
}: RevenueChartProps) {
  const percentChange =
    revenueStats.lastMonth > 0
      ? (
          ((revenueStats.thisMonth - revenueStats.lastMonth) /
            revenueStats.lastMonth) *
          100
        ).toFixed(1)
      : "0";

  const isPositive = Number(percentChange) >= 0;
  const isEmpty = !hasRevenueData(data);

  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Revenue Trend"
      description="Monthly revenue overview"
      action={
        isEmpty ? undefined : (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center border px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] ${
              isPositive
                ? "border-[rgba(58,90,73,0.25)] bg-[rgba(58,90,73,0.08)] text-[#3a5a49]"
                : "border-[rgba(154,52,18,0.25)] bg-[rgba(154,52,18,0.08)] text-[#9a3412]"
            }`}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(Number(percentChange))}%
          </span>
          <span className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
            vs last month
          </span>
        </div>
        )
      }
    >
      {isEmpty ? (
        <AnalyticsEmptyState
          icon={IndianRupee}
          message="No payments recorded this fiscal year. Revenue will appear here once students start paying fees."
        />
      ) : (
      <div className="h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={ANALYTICS_GRID_STROKE}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tickFormatter={(value: string) => value.slice(0, 3)}
              tick={{ fontSize: 12, fill: ANALYTICS_TICK_FILL }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) =>
                `NPR ${(value / PAISA_TO_RUPEES).toLocaleString()}`
              }
              tick={{ fontSize: 11, fill: ANALYTICS_TICK_FILL }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              formatter={(value) => [formatNPR(Number(value)), "Revenue"]}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={{
                r: 3,
                fill: CHART_COLORS.primary,
                strokeWidth: 0,
              }}
              activeDot={{
                r: 4,
                fill: CHART_COLORS.amber,
                strokeWidth: 0,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}
    </AnalyticsPanel>
  );
}

export function RevenueChartSkeleton({ embedded = false }: { embedded?: boolean }) {
  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Revenue Trend"
      description="Monthly revenue overview"
    >
      <div className="h-[280px] w-full animate-pulse bg-[rgba(47,78,64,0.04)]" />
    </AnalyticsPanel>
  );
}
