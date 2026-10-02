import { getAccountGroups } from "@/lib/api/account_groups";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AccountGroup, APIError } from "@repo/types";

export const useAccountGroups = () => {
  return useQuery<AccountGroup[], AxiosError<APIError>>({
    queryKey: queryKeys.accountGroups.all,
    queryFn: getAccountGroups,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};
