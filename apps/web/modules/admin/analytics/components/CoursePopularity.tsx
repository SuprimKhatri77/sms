"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CourseEntry } from "../types";
import { CHART_COLORS } from "../types";

interface CoursePopularityProps {
  data: CourseEntry[];
}

const BAR_COLORS = [
  CHART_COLORS.primary,
  "#3b82f6", // blue-500
  "#60a5fa", // blue-400
  "#93c5fd", // blue-300
];

export function CoursePopularity({ data }: CoursePopularityProps) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-[0.95rem] font-semibold text-slate-800">
          Course Popularity
        </h3>
        <p className="text-[0.75rem] text-slate-400">Most enrolled courses</p>
      </div>

      <div className="h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              domain={[0, maxCount + 10]}
            />
            <YAxis
              type="category"
              dataKey="course"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              formatter={(value) => [Number(value), "Students"]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                fontSize: 13,
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={32}>
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function CoursePopularitySkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5">
      <div className="mb-5">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
        <div className="mt-1.5 h-3 w-36 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div
              className="h-7 animate-pulse rounded bg-slate-50"
              style={{ width: `${80 - i * 15}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
