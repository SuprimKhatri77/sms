import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { deleteAccountGroup } from "@/lib/api/account_groups";
import { queryKeys } from "@/lib/query-keys";
import { APIError, DeleteAccountGroupResponse } from "@repo/types";

export const useDeleteAccountGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteAccountGroupResponse, AxiosError<APIError>, string>({
    mutationFn: deleteAccountGroup,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.accountGroups.all });
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
