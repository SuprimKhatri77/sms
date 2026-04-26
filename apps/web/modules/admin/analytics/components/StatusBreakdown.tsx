"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { StatusBreakdownData } from "../types";
import { STATUS_COLORS } from "../types";

interface StatusBreakdownProps {
  data: StatusBreakdownData;
}

interface StatusSlice {
  name: string;
  value: number;
  color: string;
}

export function StatusBreakdown({ data }: StatusBreakdownProps) {
  const total = data.approved + data.completed + data.pending + data.rejected;

  const slices: StatusSlice[] = [
    { name: "Approved", value: data.approved, color: STATUS_COLORS.approved },
    { name: "Completed", value: data.completed, color: STATUS_COLORS.completed },
    { name: "Pending", value: data.pending, color: STATUS_COLORS.pending },
    { name: "Rejected", value: data.rejected, color: STATUS_COLORS.rejected },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-[0.95rem] font-semibold text-slate-800">
          Application Status
        </h3>
        <p className="text-[0.75rem] text-slate-400">
          {total} total applications
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        {/* Donut Chart */}
        <div className="relative h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {slices.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [Number(value), "Students"]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  fontSize: 13,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label — z-0 so recharts tooltip (z-10) renders above */}
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-800">{total}</p>
              <p className="text-[0.65rem] text-slate-400">Total</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {slices.map((slice) => {
            const percentage =
              total > 0 ? ((slice.value / total) * 100).toFixed(0) : "0";

            return (
              <div
                key={slice.name}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-[0.82rem] text-slate-600">
                    {slice.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.82rem] font-semibold text-slate-800">
                    {slice.value}
                  </span>
                  <span className="text-[0.72rem] text-slate-400">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function StatusBreakdownSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5">
      <div className="mb-4">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
        <div className="mt-1.5 h-3 w-36 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-[180px] w-[180px] animate-pulse rounded-full bg-slate-50" />
        <div className="flex-1 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
