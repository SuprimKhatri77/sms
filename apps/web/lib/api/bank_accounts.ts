import {
  BankAccountsData,
  CreateBankAccountInput,
  CreateBankAccountResponse,
  DeleteBankAccountResponse,
  GetBankAccountResponse,
  SetDefaultBankAccountResponse,
  UpdateBankAccountInput,
  UpdateBankAccountResponse,
} from "@repo/types";
import api from "../axios";

export const getBankAccounts = async (
  page: number,
): Promise<BankAccountsData> => {
  const res = await api.get<GetBankAccountResponse>(
    `/admin/accounting/banks/accounts?page=${page}`,
  );
  return {
    bankAccounts: res.data.data,
    meta: res.data.meta,
  };
};

type CreateBankAccountParams = {
  bankID: string;
  data: CreateBankAccountInput;
};

export const createBankAccount = async ({
  bankID,
  data,
}: CreateBankAccountParams): Promise<CreateBankAccountResponse> => {
  const res = await api.post<CreateBankAccountResponse>(
    `/admin/accounting/banks/${bankID}/accounts`,
    data,
  );

  return res.data;
};

export type UpdateBankAccountParams = {
  data: UpdateBankAccountInput;
  accountID: string;
};
export const updateBankAccount = async ({
  data,
  accountID,
}: UpdateBankAccountParams): Promise<UpdateBankAccountResponse> => {
  const res = await api.put<UpdateBankAccountResponse>(
    `/admin/accounting/banks/accounts/${accountID}`,
    data,
  );
  return res.data;
};

type DeleteBankAccountParams = {
  accountID: string;
};
export const deleteBankAccount = async ({
  accountID,
}: DeleteBankAccountParams): Promise<DeleteBankAccountResponse> => {
  const res = await api.delete<DeleteBankAccountResponse>(
    `/admin/accounting/banks/accounts/${accountID}`,
  );
  return res.data;
};

type SetDefaultBankAccountParams = {
  accountID: string;
};

export const setDefaultBankAccount = async ({
  accountID,
}: SetDefaultBankAccountParams): Promise<SetDefaultBankAccountResponse> => {
  const res = await api.put<SetDefaultBankAccountResponse>(
    `/admin/accounting/banks/accounts/${accountID}/set-default`,
  );
  return res.data;
};
