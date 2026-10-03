import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  APIError,
  EmployeeInput,
  EmployeeMutationResponse,
} from "@repo/types";
import { updateEmployee } from "@/lib/api/employees";
import { queryKeys } from "@/lib/query-keys";

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation<
    EmployeeMutationResponse,
    AxiosError<APIError>,
    { employeeID: string; data: EmployeeInput }
  >({
    mutationFn: updateEmployee,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      // ledger rows show the employee's name
      queryClient.invalidateQueries({ queryKey: queryKeys.ledgers.all });
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
