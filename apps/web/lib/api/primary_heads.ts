import {
  CreatePrimaryHeadResponse,
  DeletePrimaryHeadResponse,
  GetPrimaryHeadsResponse,
  PrimaryHead,
  PrimaryHeadInput,
  UpdatePrimaryHeadResponse,
} from "@repo/types";
import api from "../axios";

export const getPrimaryHeads = async (): Promise<PrimaryHead[]> => {
  const res = await api.get<GetPrimaryHeadsResponse>(
    "/admin/accounting/primary-heads",
  );
  return res.data.data;
};

export const createPrimaryHead = async (
  data: PrimaryHeadInput,
): Promise<CreatePrimaryHeadResponse> => {
  const res = await api.post<CreatePrimaryHeadResponse>(
    "/admin/accounting/primary-heads",
    data,
  );
  return res.data;
};

export type UpdatePrimaryHeadParams = {
  headID: string;
  data: PrimaryHeadInput;
};

export const updatePrimaryHead = async ({
  headID,
  data,
}: UpdatePrimaryHeadParams): Promise<UpdatePrimaryHeadResponse> => {
  const res = await api.put<UpdatePrimaryHeadResponse>(
    `/admin/accounting/primary-heads/${headID}`,
    data,
  );
  return res.data;
};

export const deletePrimaryHead = async (
  headID: string,
): Promise<DeletePrimaryHeadResponse> => {
  const res = await api.delete<DeletePrimaryHeadResponse>(
    `/admin/accounting/primary-heads/${headID}`,
  );
  return res.data;
};
