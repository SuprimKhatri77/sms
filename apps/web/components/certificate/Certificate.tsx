"use client";

import { forwardRef } from "react";
import Image, { type ImageLoader } from "next/image";
import { siteInfo } from "@/utils/site-info";
import { CertificateBrandText } from "./CertificateBrandText";
import { CertificateFrame } from "./CertificateFrame";
import { CertificateSignatureSlot } from "./CertificateSignatureSlot";
import { formatPersonName } from "@/lib/format-person-name";
import { formatCertificateHeroCourseList } from "@/lib/certificate-course-title";
import {
  formatCertificateFooterAddress,
  formatCertificateFooterEmail,
} from "@/lib/certificate-footer";
import { CertificateQrCode } from "./CertificateQrCode";

export interface CertificateProps {
  studentName: string;
  referenceNo: string;
  courses: string[];
  issueDate: string;
  schoolName?: string;
  logoUrl: string;
  directorSignatureUrl?: string;
  headSignatureUrl?: string;
  accreditationLogoUrl?: string;
  footerAddress?: string;
  footerContact?: string;
  footerPhone?: string;
  qrCodeUrl?: string;
}

const passthroughLoader: ImageLoader = ({ src }) => src;

function formatCourseList(courses: string[]): string {
  return courses
    .map((c) => c.trim().replace(/,+$/, ""))
    .filter(Boolean)
    .join(", ");
}

export const Certificate = forwardRef<HTMLDivElement, CertificateProps>(
  function Certificate(
    {
      studentName,
      referenceNo,
      courses,
      issueDate,
      directorSignatureUrl,
      headSignatureUrl,
      footerAddress = siteInfo.contact.address,
      footerContact = siteInfo.contact.email,
      footerPhone = siteInfo.contact.phone,
      qrCodeUrl,
    },
    ref,
  ) {
    const cleanCourses = courses.map((c) => c.trim()).filter(Boolean);
    const displayName = formatPersonName(studentName);
    const courseTitle = formatCertificateHeroCourseList(cleanCourses);
    const displayAddress = formatCertificateFooterAddress(footerAddress);
    const displayEmail = formatCertificateFooterEmail(footerContact);

    return (
      <>
        <link rel="stylesheet" href="/certificate-print.css" />
        <div ref={ref} className="cert-root" data-certificate>
          <div className="cert-frame">
            <section className="cert-paper" aria-label="Certificate">
              <CertificateFrame />

              <div className="cert-watermark" aria-hidden="true">
                <Image
                  className="cert-watermark-img"
                  src={siteInfo.assets.emblem}
                  alt=""
                  loader={passthroughLoader}
              width={680}
              height={680}
                />
              </div>

              <header className="cert-header">
                <div className="cert-header-logo-center">
                  <Image
                    className="cert-header-wordmark"
                    src={siteInfo.assets.noBGLogo}
                    alt={siteInfo.company.shortName}
                    loader={passthroughLoader}
                    priority
                    width={600}
                    height={112}
                  />
                </div>
              </header>

              <div className="cert-body">
                <div className="cert-title-block">
                  <h1 className="cert-title">Certificate of Achievement</h1>
                  {courseTitle ? (
                    <p className="cert-course-name">{courseTitle}</p>
                  ) : null}
                  <p className="cert-presented-to">Awarded to</p>
                  <h2 className="cert-student-name">{displayName}</h2>
                </div>
                <div className="cert-title-rule" aria-hidden="true" />

                <p className="cert-body-prose">
                  This is to certify that the above named student has
                  successfully completed all required coursework and assessments
                  for a verified certificate in{" "}
                  <span className="cert-emphasis">
                    {formatCourseList(cleanCourses)}
                  </span>{" "}
                  offered by{" "}
                  <span className="cert-emphasis">
                    <CertificateBrandText text={siteInfo.company.shortName} />
                  </span>
                  .
                </p>
              </div>

              <footer className="cert-signatures" aria-label="Signatures">
                <div className="cert-sig-col">
                  <CertificateSignatureSlot
                    src={directorSignatureUrl}
                    alt="Training Director signature"
                    width={140}
                    height={52}
                  />
                  <div className="cert-sig-line" aria-hidden="true" />
                  <div className="cert-sig-label">Training Director</div>
                </div>

                <div className="cert-sig-col">
                  <CertificateSignatureSlot
                    src={headSignatureUrl}
                    alt="Head of School signature"
                    width={140}
                    height={52}
                  />
                  <div className="cert-sig-line" aria-hidden="true" />
                  <div className="cert-sig-label">Head of School</div>
                </div>

                <div className="cert-sig-col cert-sig-col-date">
                  <div className="cert-sig-date">{issueDate}</div>
                  <div className="cert-sig-line" aria-hidden="true" />
                  <div className="cert-sig-label">Date of Issue</div>
                </div>

                <div className="cert-sig-col cert-sig-col-qr">
                  {qrCodeUrl ? (
                    <CertificateQrCode value={qrCodeUrl} size={56} />
                  ) : (
                    <div
                      className="cert-signature-img cert-signature-placeholder"
                      aria-hidden="true"
                    />
                  )}
                  <div className="cert-sig-cert-no">
                    <div className="cert-sig-cert-label">Certificate No.</div>
                    <div className="cert-sig-cert-value">{referenceNo}</div>
                  </div>
                </div>
              </footer>

              <div className="cert-footer-bar">
                <div className="cert-footer-left">
                  <div className="cert-footer-line">{displayAddress}</div>
                  <div className="cert-footer-line cert-footer-pan">
                    PAN {siteInfo.company.panNo}
                  </div>
                </div>
                <div className="cert-footer-right">
                  <div className="cert-footer-line cert-footer-email">
                    {displayEmail}
                  </div>
                  <div className="cert-footer-line">{footerPhone}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </>
    );
  },
);
