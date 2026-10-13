import { getApiUrl } from "@/lib/api-url";
import {
  APIError,
  CertificateDetails,
  GetCertificateDetailsResponse,
} from "@repo/types";

type CertificateDetailsResult =
  | { status: "found"; data: CertificateDetails }
  | { status: "not_found"; message: string };

export async function getCertificateDetails(
  certificateId: string,
): Promise<CertificateDetailsResult> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/certificates/${encodeURIComponent(certificateId)}`,
    { cache: "no-store" },
  );

  if (res.status === 404) {
    const data = (await res.json()) as APIError;
    return {
      status: "not_found",
      message: data.message ?? "Certificate not found",
    };
  }

  const data = (await res.json()) as GetCertificateDetailsResponse | APIError;

  if (!res.ok || !data.success) {
    throw new Error(
      !data.success ? data.message : "Failed to load certificate details",
    );
  }

  return { status: "found", data: (data as GetCertificateDetailsResponse).data };
}
