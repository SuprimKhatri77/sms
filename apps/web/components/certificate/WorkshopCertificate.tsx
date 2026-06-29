"use client";

import { forwardRef } from "react";
import Image, { type ImageLoader } from "next/image";
import { siteInfo } from "@/utils/site-info";
import { CertificateBrandText } from "./CertificateBrandText";
import { CertificateFrame } from "./CertificateFrame";
import { CertificateSignatureSlot } from "./CertificateSignatureSlot";
import { formatPersonName } from "@/lib/format-person-name";

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
    logoUrl,
    directorSignatureUrl,
    headSignatureUrl,
    footerAddress = siteInfo.contact.address,
    footerContact = siteInfo.contact.email,
    footerPhone = siteInfo.contact.phone,
  },
  ref,
) {
  const sealUrl = siteInfo.assets.watermarkNoBG;
  const displayName = formatPersonName(studentName);

  return (
    <>
      <link rel="stylesheet" href="/certificate-print.css" />
      <div ref={ref} className="cert-root" data-certificate>
      <div className="cert-frame">
        <section className="cert-paper" aria-label="Workshop Certificate">
          <CertificateFrame />

          <div className="cert-watermark" aria-hidden="true">
            <Image
              className="cert-watermark-img"
              src={siteInfo.assets.emblem}
              alt=""
              loader={passthroughLoader}
              width={340}
              height={340}
            />
          </div>

          <header className="cert-header cert-header-workshop">
            <div className="cert-logo-wrap">
              <Image
                className="cert-logo-img"
                src={logoUrl}
                alt=""
                loader={passthroughLoader}
                priority
                width={68}
                height={68}
              />
            </div>

            <div className="cert-header-center">
              <CertificateBrandText
                text={siteInfo.company.shortName}
                className="cert-academy-name"
              />
              <div className="cert-academy-tagline">
                {siteInfo.company.tagline}
              </div>
            </div>

            <div className="cert-meta">
              <div className="cert-meta-label">Certificate No.</div>
              <div className="cert-meta-value">{referenceNo}</div>
            </div>
          </header>

          <div className="cert-body">
            <div className="cert-title-block">
              <div className="cert-title-row">
                <span className="cert-title-flourish" aria-hidden="true" />
                <h1 className="cert-title">Certificate</h1>
                <span
                  className="cert-title-flourish cert-title-flourish-right"
                  aria-hidden="true"
                />
              </div>
              <p className="cert-title-sub">of Participation</p>
            </div>
            <div className="cert-title-rule" aria-hidden="true" />

            <p className="cert-presented-to">Proudly presented to</p>
            <h2 className="cert-student-name">{displayName}</h2>
            <div className="cert-name-rule" aria-hidden="true" />

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

            <p className="cert-issued-on">Issued on {issueDate}</p>
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

            <div className="cert-seal-col">
              <Image
                className="cert-seal-img"
                src={sealUrl}
                alt="Academy seal"
                loader={passthroughLoader}
                unoptimized
                width={72}
                height={72}
              />
            </div>

            <div className="cert-sig-col">
              <CertificateSignatureSlot
                src={headSignatureUrl}
                alt="Head of School signature"
              />
              <div className="cert-sig-line" aria-hidden="true" />
              <div className="cert-sig-label">Head of School</div>
            </div>
          </footer>

          <div className="cert-footer-bar">
            <div className="cert-footer-left">
              <span>{footerAddress}</span>
              <span>PAN {siteInfo.company.panNo}</span>
            </div>
            <div className="cert-footer-right">
              {footerContact}
              <br />
              {footerPhone}
            </div>
          </div>
        </section>
      </div>
    </div>
    </>
  );
});
