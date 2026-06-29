"use client";

import { forwardRef } from "react";
import Image, { type ImageLoader } from "next/image";
import { siteInfo } from "@/utils/site-info";
import { CertificateBrandText } from "./CertificateBrandText";
import { CertificateFrame } from "./CertificateFrame";
import { CertificateSignatureSlot } from "./CertificateSignatureSlot";
import { formatPersonName } from "@/lib/format-person-name";

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
      schoolName = siteInfo.company.name,
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
  const cleanCourses = courses.map((c) => c.trim()).filter(Boolean);
  const displayName = formatPersonName(studentName);

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
              width={320}
              height={320}
            />
          </div>

          <header className="cert-header">
            <div className="cert-logo-wrap">
              <Image
                className="cert-logo-img"
                src={logoUrl}
                alt=""
                loader={passthroughLoader}
                priority
                width={72}
                height={72}
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
              <p className="cert-title-sub">of Training</p>
            </div>
            <div className="cert-title-rule" aria-hidden="true" />

            <p className="cert-presented-to">Presented to</p>
            <h2 className="cert-student-name">{displayName}</h2>
            <div className="cert-name-rule" aria-hidden="true" />

            <p className="cert-body-prose">
              This is to certify that the above-named student has successfully
              completed all required coursework and assessments for a verified
              certificate in{" "}
              <span className="cert-emphasis">
                {formatCourseList(cleanCourses)}
              </span>{" "}
              offered by{" "}
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
                width={140}
                height={52}
              />
              <div className="cert-sig-line" aria-hidden="true" />
              <div className="cert-sig-label">Training Director</div>
            </div>

            <div className="cert-seal-col">
              <Image
                className="cert-seal-img"
                src={sealUrl}
                alt={`${schoolName} seal`}
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
                width={140}
                height={52}
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
},
);
