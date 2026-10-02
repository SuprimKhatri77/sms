import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { createLedgerEntry } from "@/lib/api/ledgers";
import { queryKeys } from "@/lib/query-keys";
import {
  APIError,
  LedgerEntryInput,
  LedgerEntryMutationResponse,
} from "@repo/types";

export const useCreateLedgerEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<
    LedgerEntryMutationResponse,
    AxiosError<APIError>,
    LedgerEntryInput
  >({
    mutationFn: createLedgerEntry,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.ledgers.all });
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
