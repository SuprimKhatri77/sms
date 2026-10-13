import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import { getCertificateDetails } from "@/lib/queries/certificates/get-certificate-details";
import { CertificateNotFound } from "@/modules/certificates/CertificateNotFound";
import { CertificateVerificationPage } from "@/modules/certificates/CertificateVerificationPage";
import { siteInfo } from "@/utils/site-info";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const title = `Certificate Verification — ${siteInfo.company.shortName}`;
  const description = `Verify an official training certificate issued by ${siteInfo.company.shortName}. Certificate ID: ${id}`;

  // Not in search, but open to link-preview crawlers (robots.txt allows
  // /certificates) so a shared link shows the holder's certificate card.
  return {
    title,
    description,
    robots: noIndexRobots,
    openGraph: {
      type: "website",
      url: `/certificates/${encodeURIComponent(id)}`,
      siteName: siteInfo.company.shortName,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCertificateDetails(id);

  if (result.status === "not_found") {
    return <CertificateNotFound />;
  }

  return <CertificateVerificationPage certificate={result.data} />;
}
