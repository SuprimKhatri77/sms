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
import { AnalyticsPanel } from "./AnalyticsPanel";
import { AnalyticsEmptyState } from "./AnalyticsEmptyState";
import { hasAdmissionData } from "./analytics-empty";
import { UserPlus } from "lucide-react";
import {
  ANALYTICS_GRID_STROKE,
  ANALYTICS_TICK_FILL,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
} from "./analytics-styles";

interface AdmissionsChartProps {
  data: MonthlyAdmission[];
  embedded?: boolean;
}

export function AdmissionsChart({
  data,
  embedded = false,
}: AdmissionsChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const isEmpty = !hasAdmissionData(data);

  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Monthly Admissions"
      description="New student enrollments per month"
      action={
        isEmpty ? undefined : (
        <span className="font-[family-name:var(--font-dm-sans)] text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)]">
          Total {total}
        </span>
        )
      }
    >
      {isEmpty ? (
        <AnalyticsEmptyState
          icon={UserPlus}
          message="No admissions recorded this fiscal year. Monthly enrollments will show here as students join."
        />
      ) : (
      <div className="h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
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
              tick={{ fontSize: 12, fill: ANALYTICS_TICK_FILL }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [Number(value), "Admissions"]}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
            <Bar
              dataKey="count"
              fill={CHART_COLORS.primary}
              radius={[0, 0, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
    </AnalyticsPanel>
  );
}

export function AdmissionsChartSkeleton({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Monthly Admissions"
      description="New student enrollments per month"
    >
      <div className="h-[280px] w-full animate-pulse bg-[rgba(47,78,64,0.04)]" />
    </AnalyticsPanel>
  );
}
