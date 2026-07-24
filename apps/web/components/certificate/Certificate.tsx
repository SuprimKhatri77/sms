"use client";

import { forwardRef } from "react";
import Image, { type ImageLoader } from "next/image";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
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

              <div className="cert-shell">
                <CertificateFrame />

                <header className="cert-header">
                  <div className="cert-header-meta">
                    <div className="cert-header-meta-row">
                      <span className="cert-header-meta-label">
                        Registration No:
                      </span>{" "}
                      <span className="cert-header-meta-value">
                        {siteInfo.company.registrationNo}
                      </span>
                    </div>
                    <div className="cert-header-meta-row cert-header-meta-pan">
                      <span className="cert-header-meta-label">PAN No:</span>{" "}
                      <span className="cert-header-meta-value">
                        {siteInfo.company.panNo}
                      </span>
                    </div>
                  </div>

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

                  <div className="cert-header-qr">
                    {qrCodeUrl ? (
                      <CertificateQrCode value={qrCodeUrl} size={56} />
                    ) : (
                      <div
                        className="cert-signature-img cert-signature-placeholder"
                        aria-hidden="true"
                      />
                    )}
                    <div className="cert-header-cert-no">
                      Certificate No: <span>{referenceNo}</span>
                    </div>
                  </div>
                </header>

                <div className="cert-main">
                  <div className="cert-body">
                    <div className="cert-title-block">
                      <h1 className="cert-title">Certificate of Achievement</h1>
                      {courseTitle ? (
                        <p className="cert-course-name">{courseTitle}</p>
                      ) : null}
                    </div>

                    <p className="cert-presented-to">Awarded to</p>
                    <h2 className="cert-student-name">{displayName}</h2>
                    <div className="cert-title-rule" aria-hidden="true" />

                    <p className="cert-body-prose">
                      This is to certify that the above named student has
                      successfully completed all required coursework and
                      assessments for a verified certificate in{" "}
                      <span className="cert-emphasis">
                        {formatCourseList(cleanCourses)}
                      </span>{" "}
                      offered by{" "}
                      <span className="cert-emphasis">
                        <CertificateBrandText
                          text={siteInfo.company.shortName}
                        />
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
                        alt="Director signature"
                        width={140}
                        height={52}
                      />
                      <div className="cert-sig-line" aria-hidden="true" />
                      <div className="cert-sig-label">Director</div>
                    </div>

                    <div className="cert-sig-col cert-sig-col-date">
                      <div className="cert-sig-date">{issueDate}</div>
                      <div className="cert-sig-line" aria-hidden="true" />
                      <div className="cert-sig-label">Date of Issue</div>
                    </div>
                  </footer>
                </div>
              </div>

              <div className="cert-footer-bar">
                <div className="cert-footer-left">
                  <div className="cert-footer-item">
                    <MapPin className="cert-footer-icon" aria-hidden="true" />
                    <span>{displayAddress}</span>
                  </div>
                  <div className="cert-footer-item">
                    <Globe className="cert-footer-icon" aria-hidden="true" />
                    <span>{siteInfo.contact.website}</span>
                  </div>
                </div>
                <div className="cert-footer-right">
                  <div className="cert-footer-item">
                    <Mail className="cert-footer-icon" aria-hidden="true" />
                    <span className="cert-footer-email">{displayEmail}</span>
                  </div>
                  <div className="cert-footer-item">
                    <Phone className="cert-footer-icon" aria-hidden="true" />
                    <span>{footerPhone}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </>
    );
  },
);
