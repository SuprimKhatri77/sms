import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { deletePrimaryHead } from "@/lib/api/primary_heads";
import { queryKeys } from "@/lib/query-keys";
import { APIError, DeletePrimaryHeadResponse } from "@repo/types";

export const useDeletePrimaryHead = () => {
  const queryClient = useQueryClient();

  return useMutation<DeletePrimaryHeadResponse, AxiosError<APIError>, string>({
    mutationFn: deletePrimaryHead,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.primaryHeads.all });
      // Groups show the head they inherit by name, so any head change can
      // change what the account groups page displays.
      queryClient.invalidateQueries({ queryKey: queryKeys.accountGroups.all });
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
