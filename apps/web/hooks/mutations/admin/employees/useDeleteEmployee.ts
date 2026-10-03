import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { APIError, DeleteEmployeeResponse } from "@repo/types";
import { deleteEmployee } from "@/lib/api/employees";
import { queryKeys } from "@/lib/query-keys";

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation<
    DeleteEmployeeResponse,
    AxiosError<APIError>,
    { employeeID: string }
  >({
    mutationFn: ({ employeeID }) => deleteEmployee(employeeID),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
