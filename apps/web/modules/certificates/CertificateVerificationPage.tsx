import Link from "next/link";
import { Award, BadgeCheck, ShieldCheck } from "lucide-react";
import type { CertificateDetails } from "@repo/types";
import { Certificate } from "@/components/certificate/Certificate";
import { CertificateBrandText } from "@/components/certificate/CertificateBrandText";
import { WorkshopCertificate } from "@/components/certificate/WorkshopCertificate";
import {
  landingContainerClass,
  landingCreamSectionClass,
  landingEyebrowClass,
  landingMutedSectionClass,
  landingPrimaryButtonClass,
  landingSectionBodyClass,
  landingSectionTitleClass,
} from "@/components/landing/landing-styles";
import { getCertificateVerifyUrl } from "@/lib/certificate-url";
import { siteInfo } from "@/utils/site-info";
import { cn } from "@/lib/utils";
import {
  formatCertificateIssueDate,
  getCertificateMetaItems,
  getWorkshopTitleFromRemarks,
  parseCertificateCourses,
} from "./certificate-page-utils";

type Props = {
  certificate: CertificateDetails;
};

export function CertificateVerificationPage({ certificate }: Props) {
  const issueDate = formatCertificateIssueDate(certificate.issuedAt);
  const qrCodeUrl = getCertificateVerifyUrl(certificate.id);
  const metaItems = getCertificateMetaItems(certificate);
  const isWorkshop = certificate.type === "workshop";

  return (
    <main className="min-h-screen bg-(--brand-cream)">
      <section className={cn(landingCreamSectionClass, "pb-12 pt-28 sm:pt-32")}>
        <div className={landingContainerClass}>
          <div className="max-w-3xl text-left">
            <span
              className={cn(
                landingEyebrowClass,
                "mb-4 inline-flex items-center gap-2",
              )}
            >
              <ShieldCheck size={14} strokeWidth={2} />
              Verified Certificate
            </span>
            <h1 className={landingSectionTitleClass}>
              Official training certificate
            </h1>
            <p className={cn(landingSectionBodyClass, "mt-4")}>
              This page confirms that the certificate below was issued by{" "}
              {siteInfo.company.shortName}. Scan the QR code on the certificate
              to return to this verification record at any time.
            </p>
          </div>

          <div className="mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metaItems.map((item) => (
              <div
                key={item.label}
                className="border border-[rgba(47,78,64,0.12)] bg-white px-4 py-4 text-left"
              >
                <p className="font-(family-name:--font-dm-sans) text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[rgba(47,78,64,0.45)]">
                  {item.label}
                </p>
                <p className="mt-2 font-(family-name:--font-dm-sans) text-sm font-semibold text-(--brand-green)">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6">
        <div className={landingContainerClass}>
          <div className="mb-6 flex max-w-[794px] items-center gap-2 font-(family-name:--font-dm-sans) text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[rgba(47,78,64,0.5)]">
            <BadgeCheck size={15} className="text-(--brand-brown)" />
            Authentic certificate record
          </div>

          <div className="overflow-x-auto border border-[rgba(47,78,64,0.12)] bg-white p-4 shadow-[0_24px_64px_rgba(47,78,64,0.08)] sm:p-6">
            <div style={{ minWidth: 794 }}>
              {isWorkshop ? (
                <WorkshopCertificate
                  studentName={certificate.fullName}
                  referenceNo={certificate.referenceNo}
                  workshopTitle={getWorkshopTitleFromRemarks(certificate.remarks)}
                  workshopDate={issueDate}
                  issueDate={issueDate}
                  logoUrl={siteInfo.assets.watermarkNoBG}
                  accreditationLogoUrl={siteInfo.assets.watermarkNoBG}
                  footerAddress={siteInfo.contact.address}
                  footerContact={siteInfo.contact.email}
                  qrCodeUrl={qrCodeUrl}
                />
              ) : (
                <Certificate
                  studentName={certificate.fullName}
                  referenceNo={certificate.referenceNo}
                  courses={parseCertificateCourses(certificate.courseNames)}
                  issueDate={issueDate}
                  schoolName={siteInfo.company.name}
                  logoUrl={siteInfo.assets.watermarkNoBG}
                  accreditationLogoUrl={siteInfo.assets.watermarkNoBG}
                  footerAddress={siteInfo.contact.address}
                  footerContact={siteInfo.contact.email}
                  qrCodeUrl={qrCodeUrl}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={cn(landingMutedSectionClass, "pt-10")}>
        <div className={cn(landingContainerClass, "max-w-3xl text-left")}>
          <div className="mb-4 inline-flex items-center gap-2 text-(--brand-green)">
            <Award size={18} strokeWidth={1.75} />
            <span className="font-(family-name:--font-dm-sans) text-xs font-semibold uppercase tracking-[0.14em]">
              About this verification
            </span>
          </div>
          <h2 className="font-(family-name:--font-playfair) text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-(--brand-green)">
            Issued by{" "}
            <CertificateBrandText
              text={siteInfo.company.shortName}
              className="font-(family-name:--font-playfair) text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-(--brand-green)"
            />
          </h2>
          <p className={cn(landingSectionBodyClass, "mt-4")}>
            {siteInfo.company.tagline} If you have questions about this
            certificate, contact us at {siteInfo.contact.email} or visit our
            campus at {siteInfo.contact.address}.
          </p>
          <p className="mt-4 font-(family-name:--font-dm-sans) text-[0.82rem] leading-relaxed text-[rgba(47,78,64,0.5)]">
            Employers and institutions can use this page to confirm that the
            certificate ID, student name, and issue date match our official
            records.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
            <Link href="/#programs" className={landingPrimaryButtonClass}>
              Explore Programs
            </Link>
            <Link
              href="/#inquiry"
              className="inline-flex items-center justify-center gap-2 border border-[rgba(47,78,64,0.2)] bg-white px-5 py-2.5 font-(family-name:--font-dm-sans) text-sm font-semibold text-(--brand-green) transition-colors hover:bg-[rgba(47,78,64,0.04)]"
            >
              Contact Academy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
