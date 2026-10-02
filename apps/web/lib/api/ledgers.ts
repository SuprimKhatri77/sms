import {
  DeleteLedgerEntryResponse,
  GetLedgerEntriesResponse,
  GetLedgerSummaryResponse,
  LedgerEntriesData,
  LedgerEntryInput,
  LedgerEntryMutationResponse,
  LedgerSummary,
  LedgerType,
} from "@repo/types";
import api from "../axios";

/** The list, summary and export filters; "" means "any". */
export type LedgerFilterParams = {
  ledgerType: LedgerType | "";
  supplierID: string;
  bankID: string;
  accountID: string;
  accountGroupID: string;
  fromDate: string;
  toDate: string;
};

/** Query-string form of the filters, shared with the export menu. */
export const ledgerFilterQuery = (f: LedgerFilterParams) => ({
  type: f.ledgerType,
  supplier_id: f.supplierID,
  bank_id: f.bankID,
  account_id: f.accountID,
  account_group_id: f.accountGroupID,
  from_date: f.fromDate,
  to_date: f.toDate,
});

const toSearchParams = (f: LedgerFilterParams) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(ledgerFilterQuery(f))) {
    if (value) params.append(key, value);
  }
  return params;
};

export const getLedgerEntries = async (
  page: number,
  filters: LedgerFilterParams,
): Promise<LedgerEntriesData> => {
  const params = toSearchParams(filters);
  params.append("page", String(page));
  const res = await api.get<GetLedgerEntriesResponse>(
    `/admin/accounting/ledgers?${params.toString()}`,
  );
  return { entries: res.data.data, meta: res.data.meta };
};

export const getLedgerSummary = async (
  filters: LedgerFilterParams,
): Promise<LedgerSummary[]> => {
  const res = await api.get<GetLedgerSummaryResponse>(
    `/admin/accounting/ledgers/summary?${toSearchParams(filters).toString()}`,
  );
  return res.data.data;
};

export const createLedgerEntry = async (
  data: LedgerEntryInput,
): Promise<LedgerEntryMutationResponse> => {
  const res = await api.post<LedgerEntryMutationResponse>(
    "/admin/accounting/ledgers",
    data,
  );
  return res.data;
};

export const updateLedgerEntry = async (
  id: string,
  data: LedgerEntryInput,
): Promise<LedgerEntryMutationResponse> => {
  const res = await api.put<LedgerEntryMutationResponse>(
    `/admin/accounting/ledgers/${id}`,
    data,
  );
  return res.data;
};

export const deleteLedgerEntry = async (
  id: string,
): Promise<DeleteLedgerEntryResponse> => {
  const res = await api.delete<DeleteLedgerEntryResponse>(
    `/admin/accounting/ledgers/${id}`,
  );
  return res.data;
};
