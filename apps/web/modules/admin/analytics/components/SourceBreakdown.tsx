"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { SourceEntry } from "../types";
import { SOURCE_COLORS, formatSourceLabel } from "../types";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { AnalyticsEmptyState } from "./AnalyticsEmptyState";
import { hasSourceData } from "./analytics-empty";
import { Megaphone } from "lucide-react";
import { CHART_TOOLTIP_STYLE } from "./analytics-styles";

interface SourceBreakdownProps {
  data: SourceEntry[];
  embedded?: boolean;
}

const FALLBACK_COLORS = [
  "#2f4e40",
  "#c28a4f",
  "#3a5a49",
  "#9a3412",
  "#1a1a1a",
  "#6b7280",
];

export function SourceBreakdown({
  data,
  embedded = false,
}: SourceBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const isEmpty = !hasSourceData(data);

  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Admission Sources"
      description="Where students come from"
    >
      {isEmpty ? (
        <AnalyticsEmptyState
          icon={Megaphone}
          message="No admission source data yet. How students heard about the academy will appear here after applications come in."
        />
      ) : (
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
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
                contentStyle={CHART_TOOLTIP_STYLE}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full flex-1 divide-y divide-[rgba(47,78,64,0.08)] border border-[rgba(47,78,64,0.12)]">
          {data.map((entry, index) => {
            const color =
              SOURCE_COLORS[entry.source] ??
              FALLBACK_COLORS[index % FALLBACK_COLORS.length];
            const percentage =
              total > 0 ? ((entry.count / total) * 100).toFixed(0) : "0";

            return (
              <div
                key={entry.source}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <div
                  className="h-2.5 w-2.5 shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="flex-1 font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.7)]">
                  {formatSourceLabel(entry.source)}
                </span>
                <span className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-ink)">
                  {entry.count}
                </span>
                <span className="w-8 text-right font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </AnalyticsPanel>
  );
}

export function SourceBreakdownSkeleton({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Admission Sources"
      description="Where students come from"
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
