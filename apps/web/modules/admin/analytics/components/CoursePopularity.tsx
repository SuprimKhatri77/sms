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
import { AnalyticsPanel } from "./AnalyticsPanel";
import { AnalyticsEmptyState } from "./AnalyticsEmptyState";
import { hasCourseData } from "./analytics-empty";
import { BookOpen } from "lucide-react";
import {
  ANALYTICS_TICK_FILL,
  CHART_TOOLTIP_STYLE,
} from "./analytics-styles";

interface CoursePopularityProps {
  data: CourseEntry[];
  embedded?: boolean;
}

const BAR_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.green,
  CHART_COLORS.amber,
  "rgba(47,78,64,0.35)",
];

export function CoursePopularity({
  data,
  embedded = false,
}: CoursePopularityProps) {
  const isEmpty = !hasCourseData(data);
  const maxCount = isEmpty ? 0 : Math.max(...data.map((d) => d.count));

  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Course Popularity"
      description="Most enrolled courses"
    >
      {isEmpty ? (
        <AnalyticsEmptyState
          icon={BookOpen}
          message="No course enrollments yet. The most popular programs will rank here as students enroll."
        />
      ) : (
      <div className="h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: ANALYTICS_TICK_FILL }}
              axisLine={false}
              tickLine={false}
              domain={[0, maxCount + 10]}
            />
            <YAxis
              type="category"
              dataKey="course"
              tick={{ fontSize: 12, fill: ANALYTICS_TICK_FILL }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              formatter={(value) => [Number(value), "Students"]}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
            <Bar dataKey="count" radius={[0, 0, 0, 0]} maxBarSize={28}>
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
      )}
    </AnalyticsPanel>
  );
}

export function CoursePopularitySkeleton({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Course Popularity"
      description="Most enrolled courses"
    >
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-24 animate-pulse bg-[rgba(47,78,64,0.08)]" />
            <div
              className="h-7 animate-pulse bg-[rgba(47,78,64,0.04)]"
              style={{ width: `${80 - i * 15}%` }}
            />
          </div>
        ))}
      </div>
    </AnalyticsPanel>
  );
}
