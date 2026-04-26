"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyAdmission } from "../types";
import { CHART_COLORS } from "../types";

interface AdmissionsChartProps {
  data: MonthlyAdmission[];
}

export function AdmissionsChart({ data }: AdmissionsChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[0.95rem] font-semibold text-slate-800">
            Monthly Admissions
          </h3>
          <p className="text-[0.75rem] text-slate-400">
            New student enrollments per month
          </p>
        </div>
        <span className="text-[0.8rem] font-medium text-slate-500">
          Total: {total}
        </span>
      </div>

      <div className="h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
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
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [Number(value), "Admissions"]}
              labelStyle={{ color: "#334155", fontWeight: 600, fontSize: 13 }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                fontSize: 13,
              }}
            />
            <Bar
              dataKey="count"
              fill={CHART_COLORS.primary}
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function AdmissionsChartSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
          <div className="mt-1.5 h-3 w-48 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="h-[280px] w-full animate-pulse rounded-lg bg-slate-50" />
    </div>
  );
}
