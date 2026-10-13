"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import NextImage from "next/image";
import { siteInfo } from "@/utils/site-info";
import "./PrintAdmissionForm.css";

export interface PrintAdmissionData {
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  email?: string;
  address: string;
  photoUrl: string | null;
  guardianName: string;
  guardianPhone: string;
  courses: string[];
  source: string;
  shift: string;
  shiftTime: string;
  referenceNo: string;
}

interface Props {
  data: PrintAdmissionData;
  onClose: () => void;
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function todayFormatted() {
  return new Date().toLocaleDateString("en-NP", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function Field({
  label,
  value,
  placeholder = "—",
  className,
}: {
  label: string;
  value?: string | null;
  placeholder?: string;
  className?: string;
}) {
  const isEmpty = !value?.trim();
  return (
    <div className={`paf-field${className ? ` ${className}` : ""}`}>
      <span className="paf-label">{label}</span>
      <div className={`paf-value${isEmpty ? " empty" : ""}`}>
        {isEmpty ? placeholder : value}
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="paf-section">
      <h3 className="paf-section-title">
        <span className="paf-section-no">{number}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function PrintAdmissionForm({ data, onClose }: Props) {
  const printButtonRef = useRef<HTMLButtonElement>(null);
  const today = todayFormatted();
  const { company, contact, assets } = siteInfo;

  // The parent passes a fresh onClose each render; read the latest one
  // without re-running the effects below.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus the print action once on open; Escape closes the preview.
  // Focus goes back to whatever opened the preview when it closes.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    printButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Rendered into <body> so print CSS can drop every other top-level node
  // and leave just this sheet on a single page.
  return createPortal(
    <div
      className="print-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Admission form preview, ${data.referenceNo}`}
    >
      <div className="print-sheet-wrapper">
        {/* ── Toolbar (hidden at print time via CSS) ── */}
        <div className="print-toolbar no-print">
          <span className="print-toolbar-title">
            Admission form preview
            <span className="print-toolbar-ref">{data.referenceNo}</span>
          </span>
          <div className="print-toolbar-actions">
            <button
              ref={printButtonRef}
              type="button"
              className="print-btn print-btn-primary"
              onClick={handlePrint}
            >
              <Printer size={14} strokeWidth={1.75} />
              Print / Save PDF
            </button>
            <button
              type="button"
              className="print-btn print-btn-ghost"
              onClick={onClose}
            >
              <X size={14} strokeWidth={1.75} />
              Close
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════
            PRINTABLE DOCUMENT
            The class paf-printable-root is the anchor
            that @media print uses to show ONLY this area.
        ════════════════════════════════════════ */}
        <div className="paf paf-printable-root">
          {/* ── Letterhead ── */}
          <header className="paf-header">
            <div className="paf-brand">
              <NextImage
                src={assets.watermarkNoBG}
                alt=""
                width={42}
                height={40}
                className="paf-emblem"
                unoptimized
              />
              <div>
                <p className="paf-wordmark">Brew &amp; Bake</p>
                <p className="paf-wordmark-sub">Academy</p>
              </div>
            </div>
            <div className="paf-letterhead">
              <p className="paf-legal-name">{company.name}</p>
              <p>{contact.address}</p>
              <p>
                {contact.phone} · {contact.email}
              </p>
              <p>
                {contact.officeHours} · PAN {company.panNo}
              </p>
            </div>
          </header>

          {/* ── Title ── */}
          <div className="paf-title-row">
            <div>
              <p className="paf-eyebrow">Student admission form</p>
              <h2 className="paf-title">
                Application for <em>admission.</em>
              </h2>
              <dl className="paf-meta">
                <div>
                  <dt>Reference no.</dt>
                  <dd className="paf-ref">{data.referenceNo}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{today}</dd>
                </div>
              </dl>
            </div>
            <div className="paf-photo-box">
              {data.photoUrl ? (
                <NextImage
                  src={data.photoUrl}
                  alt="Applicant"
                  width={96}
                  height={116}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  unoptimized
                />
              ) : (
                <span className="paf-photo-placeholder">
                  Passport
                  <br />
                  photo
                </span>
              )}
            </div>
          </div>

          {/* ── Section 1: Personal ── */}
          <Section number="01" title="Personal information">
            <div className="paf-grid paf-grid-3">
              <Field
                label="Full name"
                value={data.fullName}
                className="paf-col-span-2"
              />
              <Field label="Gender" value={capitalize(data.gender)} />
              <Field label="Date of birth (BS)" value={data.dob} />
              <Field label="Phone number" value={data.phone} />
              <Field label="Email address" value={data.email} placeholder="N/A" />
              <Field
                label="Home address"
                value={data.address}
                className="paf-col-span-3"
              />
            </div>
          </Section>

          {/* ── Section 2: Guardian ── */}
          <Section number="02" title="Guardian / parent">
            <div className="paf-grid paf-grid-2">
              <Field label="Guardian full name" value={data.guardianName} />
              <Field label="Guardian phone" value={data.guardianPhone} />
            </div>
          </Section>

          {/* ── Section 3: Course ── */}
          <Section number="03" title="Course & schedule">
            <table className="paf-courses-table">
              <thead>
                <tr>
                  <th className="paf-sn">S.N.</th>
                  <th>Course</th>
                </tr>
              </thead>
              <tbody>
                {data.courses.length > 0 ? (
                  data.courses.map((course, i) => (
                    <tr key={i}>
                      <td className="paf-sn">{String(i + 1).padStart(2, "0")}</td>
                      <td className="paf-course-name">{course}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="paf-sn">—</td>
                    <td className="paf-course-empty">No courses selected</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="paf-grid paf-grid-3 paf-schedule">
              <Field label="Shift" value={capitalize(data.shift)} />
              <Field label="Shift timing" value={data.shiftTime} />
              <Field
                label="How did you hear about us"
                value={capitalize(data.source)}
              />
            </div>
          </Section>

          {/* ── Office Use Only ── */}
          <div className="paf-office-use">
            <p className="paf-office-use-title">For office use only</p>
            <div className="paf-office-grid">
              <Field label="Registration no." value="" placeholder=" " />
              <Field label="Admission date" value="" placeholder=" " />
              <Field label="Fee received (NPR)" value="" placeholder=" " />
              <Field label="Receipt no." value="" placeholder=" " />
            </div>
          </div>

          {/* ── Declaration ── */}
          <p className="paf-declaration">
            <span className="paf-declaration-label">Declaration</span>I hereby
            declare that all information provided in this form is true and
            correct to the best of my knowledge. I understand that providing
            false information may result in cancellation of my admission. I agree
            to abide by the rules and regulations of {company.name} and
            understand that our team will contact me within 24–48 hours to
            confirm enrollment.
          </p>

          {/* ── Signatures ── */}
          <div className="paf-sig-row">
            <div className="paf-sig-box">
              <div className="paf-sig-line" />
              <span className="paf-sig-label">Applicant&apos;s signature</span>
            </div>
            <div className="paf-sig-box">
              <div className="paf-sig-line" />
              <span className="paf-sig-label">Guardian&apos;s signature</span>
            </div>
            <div className="paf-sig-box">
              <div className="paf-sig-line" />
              <span className="paf-sig-label">
                Authorized signatory &amp; stamp
              </span>
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="paf-footer">
            <span>{company.shortName}</span>
            <span>{contact.website}</span>
            <span>Ref. {data.referenceNo}</span>
          </footer>
        </div>
        {/* end .paf */}
      </div>
    </div>,
    document.body,
  );
}
