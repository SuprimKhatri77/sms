"use client";

import Image, { type ImageLoader } from "next/image";
import styles from "./Certificate.module.css";

export interface CertificateProps {
  studentName: string;
  referenceNo: string; // e.g. BKC/082/083/001
  courses: string[];
  issueDate: string;
  schoolName?: string;
  logoUrl: string;
  directorSignatureUrl: string;
  headSignatureUrl: string;
  accreditationLogoUrl?: string;
  footerAddress?: string;
  footerContact?: string;
}

const passthroughLoader: ImageLoader = ({ src }) => src;

function joinCourses(courses: string[]) {
  return courses
    .map((c) => c.trim())
    .filter(Boolean)
    .join(" · ");
}

function programsLabel(count: number) {
  return count === 1 ? "program" : "programs";
}

export function Certificate({
  studentName,
  referenceNo,
  courses,
  issueDate,
  schoolName = "Bake & Brew Barista Coffee School",
  logoUrl,
  directorSignatureUrl,
  headSignatureUrl,
  accreditationLogoUrl,
  footerAddress = "Brew & Bake Academy, Kathmandu, Nepal",
  footerContact = "+977 98XXXXXXXX",
}: CertificateProps) {
  const centerMarkUrl = accreditationLogoUrl ?? logoUrl;
  const cleanCourses = courses.map((c) => c.trim()).filter(Boolean);
  return (
    <div className={styles.printScope} data-certificate>
      <div className={styles.previewFrame}>
        <section className={styles.paper} aria-label="Certificate">
          {/* Decorative top arc */}
          <svg
            className={styles.topArc}
            viewBox="0 0 1000 240"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="certificateArcGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#2f4e40" stopOpacity="0.52" />
                <stop offset="55%" stopColor="#3a5a49" stopOpacity="0.44" />
                <stop offset="100%" stopColor="#2f4e40" stopOpacity="0.40" />
              </linearGradient>
            </defs>
            <path
              d="M0,190 C150,50 360,40 520,95 C700,160 830,160 1000,90 L1000,0 L0,0 Z"
              fill="url(#certificateArcGradient)"
            />
            <path
              d="M0,206 C150,70 360,55 520,110 C700,175 830,175 1000,105"
              fill="none"
              stroke="#2f4e40"
              strokeWidth="4"
              opacity="0.35"
            />
          </svg>

          {/* Top-left logo (bleeds slightly) */}
          <div className={styles.logoCorner} aria-hidden="true">
            <Image
              className={styles.logoCornerImg}
              src={logoUrl}
              alt=""
              loader={passthroughLoader}
              priority
              width={150}
              height={150}
            />
          </div>

          {/* Top-right reference */}
          <div className={styles.topRightMeta}>
            <div className={styles.metaLabel}>Certificate No.</div>
            <div className={styles.metaValue}>{referenceNo}</div>
          </div>

          {/* Body */}
          <div className={styles.body}>
            <div className={styles.titleStack}>
              <div className={styles.scriptBig}>Certificate</div>
              <div className={styles.scriptMedium}>Of Training</div>
            </div>

            <div className={styles.schoolName}>{schoolName}</div>

            <div className={styles.scriptItalic}>This is to certify that</div>

            <div className={styles.studentBlock}>
              <div className={styles.studentName}>{studentName}</div>
              <div className={styles.studentRule} aria-hidden="true" />
            </div>

            <div className={styles.scriptItalic}>
              has successfully completed the following{" "}
              {programsLabel(cleanCourses.length)}:
            </div>

            <div className={styles.courses}>{joinCourses(cleanCourses)}</div>

            <div className={styles.scriptItalic}>on {issueDate}</div>
          </div>

          {/* Decorative footer arc + contact */}
          <div className={styles.footerArcWrap} aria-hidden="true">
            <svg
              className={styles.footerArc}
              viewBox="0 0 1000 220"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="certificateFooterGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#c28a4f" stopOpacity="0.46" />
                  <stop offset="55%" stopColor="#c28a4f" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#c28a4f" stopOpacity="0.40" />
                </linearGradient>
              </defs>
              <path
                d="M0,26 C160,146 360,171 520,131 C700,81 840,81 1000,151 L1000,220 L0,220 Z"
                fill="url(#certificateFooterGradient)"
              />
              <path
                d="M0,16 C160,130 360,155 520,115 C700,65 840,65 1000,135"
                fill="none"
                stroke="#c28a4f"
                strokeWidth="4"
                opacity="0.42"
              />
            </svg>
            <div className={styles.footerMeta}>
              <div className={styles.footerAddress}>{footerAddress}</div>
              <div className={styles.footerContact}>{footerContact}</div>
            </div>
          </div>

          {/* Bottom */}
          <footer className={styles.bottom} aria-label="Signatures">
            <div className={styles.sigCol}>
              <Image
                className={styles.signatureImg}
                src={directorSignatureUrl}
                alt="Training Director signature"
                loader={passthroughLoader}
                unoptimized
                width={240}
                height={90}
              />
              <div className={styles.sigLine} aria-hidden="true" />
              <div className={styles.sigLabel}>Training Director</div>
            </div>

            <div className={styles.centerCol}>
              <Image
                className={styles.bottomMark}
                src={centerMarkUrl}
                alt={`${schoolName} mark`}
                loader={passthroughLoader}
                unoptimized
                width={180}
                height={180}
              />
            </div>

            <div className={styles.sigCol}>
              <Image
                className={styles.signatureImg}
                src={headSignatureUrl}
                alt="Head of School signature"
                loader={passthroughLoader}
                unoptimized
                width={240}
                height={90}
              />
              <div className={styles.sigLine} aria-hidden="true" />
              <div className={styles.sigLabel}>Head of School</div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
