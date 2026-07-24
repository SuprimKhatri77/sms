import type { CertificateDetails } from "@repo/types";

export function formatCertificateIssueDate(issuedAt: string): string {
  return new Date(issuedAt).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function parseCertificateCourses(courseNames: string): string[] {
  return courseNames
    .split(",")
    .map((course) => course.trim())
    .filter(Boolean);
}

export function getWorkshopTitleFromRemarks(remarks?: string | null): string {
  const prefix = "Workshop certificate for ";
  if (remarks?.startsWith(prefix)) {
    return remarks.slice(prefix.length);
  }
  return remarks?.trim() || "Workshop";
}

export function getCertificateMetaItems(certificate: CertificateDetails) {
  return [
    { label: "Student", value: certificate.fullName },
    { label: "Certificate No.", value: certificate.referenceNo },
    {
      label: "Issued on",
      value: formatCertificateIssueDate(certificate.issuedAt),
    },
    { label: "Course Duration", value: "30 days" },
    { label: "Verification ID", value: certificate.id },
  ] as const;
}
