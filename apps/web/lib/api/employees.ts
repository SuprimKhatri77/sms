import {
  DeleteEmployeeResponse,
  EmployeeInput,
  EmployeeMutationResponse,
  EmployeesData,
  EmployeeStatus,
  GetEmployeesResponse,
} from "@repo/types";
import api from "../axios";

/** The list's filters; "" means "any". */
export type EmployeeListParams = {
  page: number;
  /** matches the name or the code */
  q: string;
  status: EmployeeStatus | "";
  limit?: number;
};

export const getEmployees = async ({
  page,
  q,
  status,
  limit,
}: EmployeeListParams): Promise<EmployeesData> => {
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (limit) params.set("limit", String(limit));
  const res = await api.get<GetEmployeesResponse>(
    `/admin/accounting/employees?${params.toString()}`,
  );
  return { employees: res.data.data, meta: res.data.meta };
};

export const createEmployee = async (
  data: EmployeeInput,
): Promise<EmployeeMutationResponse> => {
  const res = await api.post<EmployeeMutationResponse>(
    "/admin/accounting/employees",
    data,
  );
  return res.data;
};

export const updateEmployee = async ({
  employeeID,
  data,
}: {
  employeeID: string;
  data: EmployeeInput;
}): Promise<EmployeeMutationResponse> => {
  const res = await api.put<EmployeeMutationResponse>(
    `/admin/accounting/employees/${employeeID}`,
    data,
  );
  return res.data;
};

export const deleteEmployee = async (
  employeeID: string,
): Promise<DeleteEmployeeResponse> => {
  const res = await api.delete<DeleteEmployeeResponse>(
    `/admin/accounting/employees/${employeeID}`,
  );
  return res.data;
};
