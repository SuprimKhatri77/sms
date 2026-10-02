import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { createPrimaryHead } from "@/lib/api/primary_heads";
import { queryKeys } from "@/lib/query-keys";
import {
  APIError,
  CreatePrimaryHeadResponse,
  PrimaryHeadInput,
} from "@repo/types";

export const useCreatePrimaryHead = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreatePrimaryHeadResponse,
    AxiosError<APIError>,
    PrimaryHeadInput
  >({
    mutationFn: createPrimaryHead,
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
