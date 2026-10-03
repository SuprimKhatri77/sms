import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { APIError, EmployeesData } from "@repo/types";
import { EmployeeListParams, getEmployees } from "@/lib/api/employees";
import { queryKeys } from "@/lib/query-keys";

export const useEmployees = (params: EmployeeListParams) => {
  return useQuery<EmployeesData, AxiosError<APIError>>({
    queryKey: queryKeys.employees.list(params),
    queryFn: () => getEmployees(params),
    // keep the table up while a new search or page loads
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};
