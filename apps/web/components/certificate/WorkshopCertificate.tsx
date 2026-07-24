"use client";

import { forwardRef } from "react";
import Image, { type ImageLoader } from "next/image";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { siteInfo } from "@/utils/site-info";
import { CertificateBrandText } from "./CertificateBrandText";
import { CertificateFrame } from "./CertificateFrame";
import { CertificateSignatureSlot } from "./CertificateSignatureSlot";
import { formatPersonName } from "@/lib/format-person-name";
import {
  formatCertificateFooterAddress,
  formatCertificateFooterEmail,
} from "@/lib/certificate-footer";
import { CertificateQrCode } from "./CertificateQrCode";

export interface WorkshopCertificateProps {
  studentName: string;
  referenceNo: string;
  workshopTitle: string;
  workshopDate: string;
  issueDate: string;
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

export const WorkshopCertificate = forwardRef<
  HTMLDivElement,
  WorkshopCertificateProps
>(function WorkshopCertificate(
  {
    studentName,
    referenceNo,
    workshopTitle,
    workshopDate,
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
  const displayName = formatPersonName(studentName);
  const displayAddress = formatCertificateFooterAddress(footerAddress);
  const displayEmail = formatCertificateFooterEmail(footerContact);

  return (
    <>
      <link rel="stylesheet" href="/certificate-print.css" />
      <div ref={ref} className="cert-root" data-certificate>
        <div className="cert-frame">
          <section className="cert-paper" aria-label="Workshop Certificate">
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

            <header className="cert-header cert-header-workshop">
              <div className="cert-header-meta">
                <div className="cert-header-meta-label">Registration No.</div>
                <div className="cert-header-meta-value">
                  {siteInfo.company.registrationNo}
                </div>
                <div className="cert-header-meta-label cert-header-meta-pan">
                  PAN
                </div>
                <div className="cert-header-meta-value">
                  {siteInfo.company.panNo}
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
              </div>
            </header>

            <div className="cert-main">
              <CertificateFrame />

              <div className="cert-body">
                <div className="cert-title-block">
                  <h1 className="cert-title">Certificate of Participation</h1>
                  <p className="cert-course-name">{workshopTitle}</p>
                  <p className="cert-presented-to">Awarded to</p>
                  <h2 className="cert-student-name">{displayName}</h2>
                </div>
                <div className="cert-title-rule" aria-hidden="true" />

                <p className="cert-body-prose">
                  This is to certify that the above-named individual has
                  successfully attended and participated in the workshop{" "}
                  <span className="cert-emphasis">{workshopTitle}</span> held on{" "}
                  <span className="cert-emphasis">{workshopDate}</span>, organised
                  by{" "}
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
                  />
                  <div className="cert-sig-line" aria-hidden="true" />
                  <div className="cert-sig-label">Training Director</div>
                </div>

                <div className="cert-sig-col">
                  <CertificateSignatureSlot
                    src={headSignatureUrl}
                    alt="Head of School signature"
                  />
                  <div className="cert-sig-line" aria-hidden="true" />
                  <div className="cert-sig-label">Head of School</div>
                </div>

                <div className="cert-sig-col cert-sig-col-date">
                  <div className="cert-sig-date">{issueDate}</div>
                  <div className="cert-sig-line" aria-hidden="true" />
                  <div className="cert-sig-label">Date of Issue</div>
                </div>

                <div className="cert-sig-col cert-sig-col-cert-no">
                  <div className="cert-sig-cert-value">{referenceNo}</div>
                  <div className="cert-sig-line" aria-hidden="true" />
                  <div className="cert-sig-label">Certificate No.</div>
                </div>
              </footer>
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
});
