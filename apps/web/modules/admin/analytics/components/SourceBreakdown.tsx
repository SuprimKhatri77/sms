"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SourceEntry } from "../types";
import { SOURCE_COLORS, formatSourceLabel } from "../types";

interface SourceBreakdownProps {
  data: SourceEntry[];
}

const FALLBACK_COLORS = ["#2563eb", "#0f172a", "#22c55e", "#f59e0b", "#8b5cf6"];

export function SourceBreakdown({ data }: SourceBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-[0.95rem] font-semibold text-slate-800">
          Admission Sources
        </h3>
        <p className="text-[0.75rem] text-slate-400">
          Where students come from
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        {/* Donut Chart */}
        <div className="h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                nameKey="source"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.source}
                    fill={
                      SOURCE_COLORS[entry.source] ??
                      FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  Number(value),
                  formatSourceLabel(String(name)),
                ]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  fontSize: 13,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {data.map((entry, index) => {
            const color =
              SOURCE_COLORS[entry.source] ??
              FALLBACK_COLORS[index % FALLBACK_COLORS.length];
            const percentage =
              total > 0 ? ((entry.count / total) * 100).toFixed(0) : "0";

            return (
              <div key={entry.source} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="flex-1 text-[0.82rem] text-slate-600">
                  {formatSourceLabel(entry.source)}
                </span>
                <span className="text-[0.82rem] font-medium text-slate-800">
                  {entry.count}
                </span>
                <span className="text-[0.72rem] text-slate-400">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function SourceBreakdownSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5">
      <div className="mb-4">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
        <div className="mt-1.5 h-3 w-40 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-[180px] w-[180px] animate-pulse rounded-full bg-slate-50" />
        <div className="flex-1 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-3 animate-pulse rounded-full bg-slate-100" />
              <div className="h-3 flex-1 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-8 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
