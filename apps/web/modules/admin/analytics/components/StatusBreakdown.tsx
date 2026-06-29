"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusBreakdownData } from "../types";
import { STATUS_COLORS } from "../types";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { AnalyticsEmptyState } from "./AnalyticsEmptyState";
import { hasStatusData } from "./analytics-empty";
import { ClipboardList } from "lucide-react";
import { CHART_TOOLTIP_STYLE } from "./analytics-styles";

interface StatusBreakdownProps {
  data: StatusBreakdownData;
  embedded?: boolean;
}

interface StatusSlice {
  name: string;
  value: number;
  color: string;
}

export function StatusBreakdown({
  data,
  embedded = false,
}: StatusBreakdownProps) {
  const total = data.active + data.completed + data.pending + data.rejected;
  const isEmpty = !hasStatusData(data);

  const slices: StatusSlice[] = [
    { name: "Active", value: data.active, color: STATUS_COLORS.active },
    {
      name: "Completed",
      value: data.completed,
      color: STATUS_COLORS.completed,
    },
    { name: "Pending", value: data.pending, color: STATUS_COLORS.pending },
    { name: "Rejected", value: data.rejected, color: STATUS_COLORS.rejected },
  ];

  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Application Status"
      description={
        isEmpty ? "Student status overview" : `${total} total applications`
      }
    >
      {isEmpty ? (
        <AnalyticsEmptyState
          icon={ClipboardList}
          message="No students enrolled yet. Application status counts will appear here once students are added."
        />
      ) : (
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
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
                contentStyle={CHART_TOOLTIP_STYLE}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <div className="text-center">
              <p className="font-[family-name:var(--font-lora)] text-xl font-bold text-(--brand-ink)">
                {total}
              </p>
              <p className="font-[family-name:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.1em] text-[rgba(47,78,64,0.45)]">
                Total
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex-1 divide-y divide-[rgba(47,78,64,0.08)] border border-[rgba(47,78,64,0.12)]">
          {slices.map((slice) => {
            const percentage =
              total > 0 ? ((slice.value / total) * 100).toFixed(0) : "0";

            return (
              <div
                key={slice.name}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-2.5 w-2.5 shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.7)]">
                    {slice.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-ink)">
                    {slice.value}
                  </span>
                  <span className="w-8 text-right font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </AnalyticsPanel>
  );
}

export function StatusBreakdownSkeleton({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Application Status"
      description="Loading application breakdown"
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="h-[180px] w-[180px] animate-pulse bg-[rgba(47,78,64,0.04)]" />
        <div className="w-full flex-1 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse border border-[rgba(47,78,64,0.08)] bg-[rgba(47,78,64,0.03)]"
            />
          ))}
        </div>
      </div>
    </AnalyticsPanel>
  );
}
