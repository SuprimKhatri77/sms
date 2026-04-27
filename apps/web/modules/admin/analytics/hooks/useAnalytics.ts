"use client";

import { useQuery } from "@tanstack/react-query";
// TODO: Uncomment when wiring to real API
import api from "@/lib/axios";
import { AnalyticsResponse } from "@repo/types";

export function useAnalytics() {
  return useQuery<AnalyticsResponse>({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await api.get<AnalyticsResponse>("/admin/analytics");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
