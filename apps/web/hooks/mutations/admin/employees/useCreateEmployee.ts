import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  APIError,
  EmployeeInput,
  EmployeeMutationResponse,
} from "@repo/types";
import { createEmployee } from "@/lib/api/employees";
import { queryKeys } from "@/lib/query-keys";

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation<
    EmployeeMutationResponse,
    AxiosError<APIError>,
    EmployeeInput
  >({
    mutationFn: createEmployee,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
