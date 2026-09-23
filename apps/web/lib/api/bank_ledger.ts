import {
  BankAccountForDropdown,
  BankLedgerData,
  BankLedgerSummary,
  CreateBankLedgerEntryInput,
  CreateBankLedgerEntryResponse,
  GetBankAccountsForDropdownResponse,
  GetBankLedgerResponse,
  GetBankLedgerSummaryRepsonse,
} from "@repo/types";
import api from "../axios";

type GetBankLedgerParams = {
  page: number;
  bankID?: string;
  accountID?: string;
  fromDate?: string | null;
  toDate?: string | null;
};
export const getBankLedger = async ({
  page = 1,
  bankID,
  accountID,
  fromDate,
  toDate,
}: GetBankLedgerParams): Promise<BankLedgerData> => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  if (bankID && bankID !== "all") params.append("bank_id", bankID);
  if (accountID && accountID !== "all") params.append("account_id", accountID);
  if (fromDate) params.append("from_date", fromDate);
  if (toDate) params.append("to_date", toDate);
  const res = await api.get<GetBankLedgerResponse>(
    `/admin/accounting/banks/ledger?${params.toString()}`,
  );
  return {
    bankLedger: res.data.data,
    meta: res.data.meta,
  };
};

export type GetBankLedgerSummaryParams = {
  bankID?: string;
  accountID?: string;
  fromDate?: string | null;
  toDate?: string | null;
};
export const getBankLedgerSummary = async ({
  bankID,
  accountID,
  fromDate,
  toDate,
}: GetBankLedgerSummaryParams): Promise<BankLedgerSummary> => {
  const params = new URLSearchParams();
  if (bankID && bankID !== "all") params.append("bank_id", bankID);
  if (accountID && accountID !== "all") params.append("account_id", accountID);
  if (fromDate) params.append("from_date", fromDate);
  if (toDate) params.append("to_date", toDate);
  const res = await api.get<GetBankLedgerSummaryRepsonse>(
    `/admin/accounting/banks/ledger/summary?${params.toString()}`,
  );
  return res.data.data;
};

export const getBankAccountsForDropdown = async (): Promise<
  BankAccountForDropdown[]
> => {
  const res = await api.get<GetBankAccountsForDropdownResponse>(
    "/admin/accounting/banks/accounts/dropdown",
  );
  return res.data.data;
};

type SearchBankAccountsForDropdownParams = {
  name?: string;
  bankID?: string;
  limit: number;
};
export const searchBankAccountsForDropdown = async ({
  name,
  bankID,
  limit,
}: SearchBankAccountsForDropdownParams): Promise<BankAccountForDropdown[]> => {
  const params = new URLSearchParams();
  params.append("limit", String(limit));
  if (name) params.append("name", name);
  if (bankID && bankID !== "all") params.append("bank_id", bankID);
  const res = await api.get<GetBankAccountsForDropdownResponse>(
    `/admin/accounting/banks/accounts/dropdown?${params.toString()}`,
  );
  return res.data.data;
};

type CreateBankLedgerParams = {
  data: CreateBankLedgerEntryInput;
  accountID: string;
};
export const createBankLedger = async ({
  accountID,
  data,
}: CreateBankLedgerParams): Promise<CreateBankLedgerEntryResponse> => {
  const res = await api.post<CreateBankLedgerEntryResponse>(
    `/admin/accounting/banks/ledger/${accountID}`,
    { ...data, amount: Number(data.amount) },
  );
  return res.data;
};
