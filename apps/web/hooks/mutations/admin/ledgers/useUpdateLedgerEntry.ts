import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { updateLedgerEntry } from "@/lib/api/ledgers";
import { queryKeys } from "@/lib/query-keys";
import {
  APIError,
  LedgerEntryInput,
  LedgerEntryMutationResponse,
} from "@repo/types";

export const useUpdateLedgerEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<
    LedgerEntryMutationResponse,
    AxiosError<APIError>,
    { id: string; data: LedgerEntryInput }
  >({
    mutationFn: ({ id, data }) => updateLedgerEntry(id, data),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.ledgers.all });
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
