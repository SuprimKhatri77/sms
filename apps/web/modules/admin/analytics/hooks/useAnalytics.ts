"use client";

import { useQuery } from "@tanstack/react-query";
// TODO: Uncomment when wiring to real API
// import api from "@/lib/axios";
import type { AnalyticsResponse } from "../types";

const ANALYTICS_QUERY_KEY = ["admin-analytics"] as const;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DATA: AnalyticsResponse = {
  overview: {
    totalStudents: 120,
    pendingApprovals: 8,
    totalRevenue: 450000,
    studentsWithBalance: 23,
  },
  monthlyRevenue: [
    { month: "January", amount: 45000 },
    { month: "February", amount: 62000 },
    { month: "March", amount: 38000 },
    { month: "April", amount: 71000 },
    { month: "May", amount: 55000 },
  ],
  monthlyAdmissions: [
    { month: "January", count: 12 },
    { month: "February", count: 18 },
    { month: "March", count: 9 },
    { month: "April", count: 22 },
    { month: "May", count: 15 },
  ],
  sourceBreakdown: [
    { source: "facebook", count: 45 },
    { source: "tiktok", count: 30 },
    { source: "referral", count: 25 },
    { source: "in_person", count: 20 },
  ],
  statusBreakdown: {
    pending: 8,
    approved: 98,
    completed: 45,
    rejected: 14,
  },
  coursePopularity: [
    { course: "Web Development", count: 67 },
    { course: "Graphic Design", count: 45 },
    { course: "Digital Marketing", count: 38 },
    { course: "Video Editing", count: 29 },
  ],
  inquiries: {
    total: 89,
    unread: 12,
    monthlyInquiries: [
      { month: "January", count: 8 },
      { month: "February", count: 14 },
      { month: "March", count: 6 },
      { month: "April", count: 19 },
      { month: "May", count: 11 },
    ],
  },
  revenueStats: {
    thisMonth: 45000,
    lastMonth: 38000,
    outstanding: 120000,
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches analytics data. Currently returns mock data.
 * Swap the queryFn to use the real API once it's ready:
 *   const res = await api.get<AnalyticsResponse>("/admin/analytics");
 *   return res.data;
 */
export function useAnalytics() {
  return useQuery<AnalyticsResponse>({
    queryKey: ANALYTICS_QUERY_KEY,
    queryFn: async () => {
      // TODO: Replace with real API call
      // const res = await api.get<AnalyticsResponse>("/admin/analytics");
      // return res.data;

      // Simulate network delay for skeleton testing
      await new Promise((resolve) => setTimeout(resolve, 800));
      return MOCK_DATA;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
