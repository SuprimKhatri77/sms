import { formatCertificateHeroCourseList } from "@/lib/certificate-course-title";
import { formatPersonName } from "@/lib/format-person-name";
import { getCertificateDetails } from "@/lib/queries/certificates/get-certificate-details";
import {
  createOgImage,
  ogImageContentType,
  ogImageSize,
} from "@/lib/og-image";
import {
  formatCertificateIssueDate,
  getWorkshopTitleFromRemarks,
  parseCertificateCourses,
} from "@/modules/certificates/certificate-page-utils";
import { siteInfo } from "@/utils/site-info";

export const alt = `Certificate verification — ${siteInfo.company.shortName}`;
export const size = ogImageSize;
export const contentType = ogImageContentType;

/** The holder's name and course, so a shared link previews the certificate. */
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCertificateDetails(id).catch(() => null);

  if (result?.status !== "found") {
    return createOgImage({
      eyebrow: "Certificate verification",
      title: { lead: "Certificate", em: "verification." },
      description: `Check a training certificate issued by ${siteInfo.company.shortName}.`,
    });
  }

  const certificate = result.data;
  const isWorkshop = certificate.type === "workshop";
  // Name and course read as they do on the certificate itself.
  const fullName = formatPersonName(certificate.fullName);
  const names = fullName.split(/\s+/);
  const surname = names.pop() ?? fullName;
  const courses = formatCertificateHeroCourseList(
    parseCertificateCourses(certificate.courseNames),
  );

  return createOgImage({
    eyebrow: isWorkshop ? "Verified workshop certificate" : "Verified certificate",
    title: { lead: names.join(" "), em: `${surname}.` },
    description: isWorkshop
      ? getWorkshopTitleFromRemarks(certificate.remarks)
      : courses ||
        `Completed professional training at ${siteInfo.company.shortName}.`,
    footer: `Issued ${formatCertificateIssueDate(certificate.issuedAt)}`,
    detail: `No. ${certificate.referenceNo}`,
  });
}
