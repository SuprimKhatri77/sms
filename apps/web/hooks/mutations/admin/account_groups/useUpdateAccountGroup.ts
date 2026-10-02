import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  updateAccountGroup,
  type UpdateAccountGroupParams,
} from "@/lib/api/account_groups";
import { queryKeys } from "@/lib/query-keys";
import { APIError, UpdateAccountGroupResponse } from "@repo/types";

export const useUpdateAccountGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAccountGroupResponse,
    AxiosError<APIError>,
    UpdateAccountGroupParams
  >({
    mutationFn: updateAccountGroup,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.accountGroups.all });
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
