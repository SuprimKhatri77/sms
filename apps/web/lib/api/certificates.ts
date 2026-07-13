import {
  GetStudentCertificatesResponse,
  IssueCertificateInput,
  IssueCertificateResponse,
} from "@repo/types";
import api from "../axios";

export const getStudentCertificates = async (
  studentId: string,
): Promise<GetStudentCertificatesResponse> => {
  const res = await api.get<GetStudentCertificatesResponse>(
    `/admin/certificates/${studentId}`,
  );
  return res.data;
};

export const issueCertificate = async (
  studentId: string,
  data: IssueCertificateInput,
): Promise<IssueCertificateResponse> => {
  const res = await api.post<IssueCertificateResponse>(
    `/admin/certificates/${studentId}`,
    data,
  );
  return res.data;
};
