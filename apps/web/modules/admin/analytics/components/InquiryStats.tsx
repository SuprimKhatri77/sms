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

interface InquiryStatsProps {
  data: InquiriesData;
}

export function InquiryStats({ data }: InquiryStatsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-[0.95rem] font-semibold text-slate-800">
          Inquiry Stats
        </h3>
        <p className="text-[0.75rem] text-slate-400">
          Student inquiry overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[0.7rem] text-slate-400">Total</p>
              <p className="text-lg font-bold text-slate-800">{data.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50">
              <Mail className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[0.7rem] text-slate-400">Unread</p>
              <p className="text-lg font-bold text-slate-800">{data.unread}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.monthlyInquiries}
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
              formatter={(value) => [Number(value), "Inquiries"]}
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
              dataKey="count"
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

export function InquiryStatsSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5">
      <div className="mb-5">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        <div className="mt-1.5 h-3 w-36 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 animate-pulse rounded-md bg-slate-100" />
              <div>
                <div className="h-2.5 w-10 animate-pulse rounded bg-slate-100" />
                <div className="mt-1.5 h-5 w-8 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-[200px] w-full animate-pulse rounded-lg bg-slate-50" />
    </div>
  );
}
