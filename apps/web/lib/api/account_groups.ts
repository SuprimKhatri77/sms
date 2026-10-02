import {
  AccountGroup,
  AccountGroupInput,
  CreateAccountGroupResponse,
  DeleteAccountGroupResponse,
  GetAccountGroupsResponse,
  UpdateAccountGroupResponse,
} from "@repo/types";
import api from "../axios";

export const getAccountGroups = async (): Promise<AccountGroup[]> => {
  const res = await api.get<GetAccountGroupsResponse>(
    "/admin/accounting/account-groups",
  );
  return res.data.data;
};

export const createAccountGroup = async (
  data: AccountGroupInput,
): Promise<CreateAccountGroupResponse> => {
  const res = await api.post<CreateAccountGroupResponse>(
    "/admin/accounting/account-groups",
    data,
  );
  return res.data;
};

export type UpdateAccountGroupParams = {
  groupID: string;
  data: AccountGroupInput;
};

export const updateAccountGroup = async ({
  groupID,
  data,
}: UpdateAccountGroupParams): Promise<UpdateAccountGroupResponse> => {
  const res = await api.put<UpdateAccountGroupResponse>(
    `/admin/accounting/account-groups/${groupID}`,
    data,
  );
  return res.data;
};

export const deleteAccountGroup = async (
  groupID: string,
): Promise<DeleteAccountGroupResponse> => {
  const res = await api.delete<DeleteAccountGroupResponse>(
    `/admin/accounting/account-groups/${groupID}`,
  );
  return res.data;
};
