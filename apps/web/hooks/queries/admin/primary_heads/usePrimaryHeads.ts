import { getPrimaryHeads } from "@/lib/api/primary_heads";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { APIError, PrimaryHead } from "@repo/types";

export const usePrimaryHeads = () => {
  return useQuery<PrimaryHead[], AxiosError<APIError>>({
    queryKey: queryKeys.primaryHeads.all,
    queryFn: getPrimaryHeads,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};
