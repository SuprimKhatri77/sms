import { getBankAccountsForDropdown } from "@/lib/api/bank_accounts";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export const useBankAccountsDropdown = () => {
  return useQuery({
    queryKey: queryKeys.bankAccounts.dropdown,
    queryFn: getBankAccountsForDropdown,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 20,
  });
};
