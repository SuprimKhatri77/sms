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

interface RevenueChartProps {
  data: MonthlyRevenue[];
  revenueStats: RevenueStatsData;
}

export function RevenueChart({ data, revenueStats }: RevenueChartProps) {
  const percentChange =
    revenueStats.lastMonth > 0
      ? (
          ((revenueStats.thisMonth - revenueStats.lastMonth) /
            revenueStats.lastMonth) *
          100
        ).toFixed(1)
      : "0";

  const isPositive = Number(percentChange) >= 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[0.95rem] font-semibold text-slate-800">
            Revenue Trend
          </h3>
          <p className="text-[0.75rem] text-slate-400">Monthly revenue overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.72rem] font-medium ${
              isPositive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(Number(percentChange))}%
          </span>
          <span className="text-[0.75rem] text-slate-400">vs last month</span>
        </div>
      </div>

      <div className="h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tickFormatter={(value: string) => value.slice(0, 3)}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) =>
                `NPR ${(value / PAISA_TO_RUPEES).toLocaleString()}`
              }
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              formatter={(value) => [formatNPR(Number(value)), "Revenue"]}
              labelStyle={{ color: "#334155", fontWeight: 600, fontSize: 13 }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                fontSize: 13,
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={CHART_COLORS.primary}
              strokeWidth={2.5}
              dot={{ r: 4, fill: CHART_COLORS.primary, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: CHART_COLORS.primary, strokeWidth: 2, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function RevenueChartSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
          <div className="mt-1.5 h-3 w-40 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="h-[280px] w-full animate-pulse rounded-lg bg-slate-50" />
    </div>
  );
}
