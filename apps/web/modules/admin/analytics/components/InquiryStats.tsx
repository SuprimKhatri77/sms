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
import { MessageSquare, Mail } from "lucide-react";
import type { InquiriesData } from "../types";
import { CHART_COLORS } from "../types";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { AnalyticsEmptyState } from "./AnalyticsEmptyState";
import { hasInquiryData } from "./analytics-empty";
import {
  ANALYTICS_GRID_STROKE,
  ANALYTICS_TICK_FILL,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
} from "./analytics-styles";

interface InquiryStatsProps {
  data: InquiriesData;
  embedded?: boolean;
}

export function InquiryStats({ data, embedded = false }: InquiryStatsProps) {
  const isEmpty = !hasInquiryData(data);

  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Inquiry Stats"
      description="Student inquiry overview"
    >
      {isEmpty ? (
        <AnalyticsEmptyState
          icon={MessageSquare}
          message="No inquiries received yet. Messages from the website contact form will show up here."
        />
      ) : (
      <>
      <div className="mb-5 grid grid-cols-2 gap-px border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.08)]">
        <div className="bg-[rgba(251,250,247,0.8)] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center border border-[rgba(47,78,64,0.12)] text-(--brand-green)">
              <MessageSquare className="h-4 w-4" />
            </span>
            <div>
              <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.1em] text-[rgba(47,78,64,0.45)]">
                Total
              </p>
              <p className="font-[family-name:var(--font-lora)] text-xl font-bold text-(--brand-ink)">
                {data.total}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[rgba(251,250,247,0.8)] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center border border-[rgba(47,78,64,0.12)] text-(--brand-brown)">
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.1em] text-[rgba(47,78,64,0.45)]">
                Unread
              </p>
              <p className="font-[family-name:var(--font-lora)] text-xl font-bold text-(--brand-ink)">
                {data.unread}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[200px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.monthlyInquiries}
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
              formatter={(value) => [Number(value), "Inquiries"]}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
            <Line
              type="monotone"
              dataKey="count"
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
      </>
      )}
    </AnalyticsPanel>
  );
}

export function InquiryStatsSkeleton({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  return (
    <AnalyticsPanel
      embedded={embedded}
      title="Inquiry Stats"
      description="Student inquiry overview"
    >
      <div className="mb-5 grid grid-cols-2 gap-px border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.08)]">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-[rgba(251,250,247,0.8)] p-4"
          >
            <div className="h-8 w-24 animate-pulse bg-[rgba(47,78,64,0.08)]" />
            <div className="mt-2 h-6 w-10 animate-pulse bg-[rgba(47,78,64,0.08)]" />
          </div>
        ))}
      </div>
      <div className="h-[200px] w-full animate-pulse bg-[rgba(47,78,64,0.04)]" />
    </AnalyticsPanel>
  );
}
