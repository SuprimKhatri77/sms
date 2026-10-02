import { getLedgerSummary, type LedgerFilterParams } from "@/lib/api/ledgers";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export const useLedgerSummary = (filters: LedgerFilterParams) => {
  return useQuery({
    queryKey: queryKeys.ledgers.summary(filters),
    queryFn: () => getLedgerSummary(filters),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
