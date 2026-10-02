import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { deleteLedgerEntry } from "@/lib/api/ledgers";
import { queryKeys } from "@/lib/query-keys";
import { APIError, DeleteLedgerEntryResponse } from "@repo/types";

export const useDeleteLedgerEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteLedgerEntryResponse, AxiosError<APIError>, string>({
    mutationFn: deleteLedgerEntry,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.ledgers.all });
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
