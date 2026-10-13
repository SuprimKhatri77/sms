import Link from "next/link";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import type { CertificateDetails } from "@repo/types";
import { Certificate } from "@/components/certificate/Certificate";
import { WorkshopCertificate } from "@/components/certificate/WorkshopCertificate";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ButtonArrow, siteButton } from "@/components/site/button";
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
    // font-site stays off <main> so the certificate inherits exactly what it
    // always has; the sections around it opt in.
    <main className="bg-paper">
      <section className="container-page pt-10 pb-12 font-site sm:pt-14 sm:pb-16">
        <Breadcrumbs
          className="animate-rise"
          items={[
            { label: "Home", href: "/" },
            { label: "Certificate verification" },
          ]}
        />

        <div className="mt-10 max-w-3xl">
          <p
            className="eyebrow animate-rise flex items-center gap-2"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            <ShieldCheck
              aria-hidden
              className="h-3.5 w-3.5 text-pine"
              strokeWidth={1.75}
            />
            Verified certificate
          </p>
          <h1
            className="display animate-rise mt-4 text-[clamp(3rem,7vw,5.5rem)] text-ink"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            Official training <em>certificate.</em>
          </h1>
          <p
            className="animate-rise mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            This page confirms that the certificate below was issued by{" "}
            {siteInfo.company.shortName}. Scan the QR code on the certificate
            to return to this verification record at any time.
          </p>
        </div>

        <dl
          className="animate-rise mt-12 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.6fr)]"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          {metaItems.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "bg-paper px-5 py-5",
                // Five cells on two columns: the last one spans the row.
                index === metaItems.length - 1 && "sm:col-span-2 lg:col-span-1",
              )}
            >
              <dt className="eyebrow">{item.label}</dt>
              <dd
                className={cn(
                  "mt-2 text-ink",
                  item.label === "Verification ID"
                    ? "font-label text-[0.75rem] break-all"
                    : "text-[0.9375rem]",
                )}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-label="Certificate"
        className="container-page pb-20 sm:pb-28"
      >
        <p className="eyebrow mb-5 flex items-center gap-2">
          <BadgeCheck
            aria-hidden
            className="h-3.5 w-3.5 text-clay-deep"
            strokeWidth={1.75}
          />
          Authentic certificate record
        </p>

        {/* The certificate is fixed at 794px; this well scrolls on phones. */}
        <div className="overflow-x-auto border border-hairline bg-surface p-3 sm:p-6">
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
      </section>

      <section className="border-t border-hairline bg-surface py-20 font-site sm:py-28">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow">About this verification</p>
            <h2 className="display mt-4 text-5xl text-ink sm:text-6xl">
              Issued by <em>{siteInfo.company.shortName}.</em>
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-[0.9375rem] leading-relaxed text-ink-muted">
              {siteInfo.company.tagline} If you have questions about this
              certificate, contact us at {siteInfo.contact.email} or visit our
              campus at {siteInfo.contact.address}.
            </p>
            <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-muted">
              Employers and institutions can use this page to confirm that the
              certificate ID, student name, and issue date match our official
              records.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/courses"
                className={siteButton({ variant: "pine", size: "lg" })}
              >
                Explore programs
                <ButtonArrow />
              </Link>
              <Link
                href="/#inquiry"
                className={siteButton({ variant: "outline", size: "lg" })}
              >
                Contact academy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
