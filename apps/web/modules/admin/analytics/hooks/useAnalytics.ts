"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import { AnalyticsResponse } from "@repo/types";

export type AnalyticsDateRange = {
  from?: string | null;
  to?: string | null;
};

export function useAnalytics(range?: AnalyticsDateRange) {
  const from = range?.from || undefined;
  const to = range?.to || undefined;

  return useQuery<AnalyticsResponse>({
    queryKey: queryKeys.analytics.detail(from, to),
    queryFn: async () => {
      const res = await api.get<AnalyticsResponse>("/admin/analytics", {
        params: {
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
