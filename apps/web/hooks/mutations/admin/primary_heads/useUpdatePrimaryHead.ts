import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  updatePrimaryHead,
  type UpdatePrimaryHeadParams,
} from "@/lib/api/primary_heads";
import { queryKeys } from "@/lib/query-keys";
import { APIError, UpdatePrimaryHeadResponse } from "@repo/types";

export const useUpdatePrimaryHead = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdatePrimaryHeadResponse,
    AxiosError<APIError>,
    UpdatePrimaryHeadParams
  >({
    mutationFn: updatePrimaryHead,
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
