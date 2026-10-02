import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { createAccountGroup } from "@/lib/api/account_groups";
import { queryKeys } from "@/lib/query-keys";
import {
  APIError,
  CreateAccountGroupResponse,
  AccountGroupInput,
} from "@repo/types";

export const useCreateAccountGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAccountGroupResponse,
    AxiosError<APIError>,
    AccountGroupInput
  >({
    mutationFn: createAccountGroup,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.accountGroups.all });
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
