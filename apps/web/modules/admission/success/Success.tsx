"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Phone,
  Printer,
  User,
} from "lucide-react";
import PrintAdmissionForm, { PrintAdmissionData } from "../PrintAdmissionForm";
import { siteInfo } from "@/utils/site-info";
import { useAdmissionStore } from "@/store/useAdmissionStore";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import {
  admissionCalloutClass,
  admissionPrimaryBtnClass,
} from "../admission-styles";

export interface SubmittedAdmission {
  referenceNo: string;
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  source: string;
  shift: "morning" | "day" | "evening";
  shiftTime: string;
  courses: string[];
  photoURL: string | null;
  status: "pending" | "active" | "rejected" | "completed";
  createdAt: string;
  fiscalYear: string;
  email: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NP", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function buildPrintData(student: SubmittedAdmission): PrintAdmissionData {
  return {
    fullName: student.fullName,
    dob: student.dob,
    gender: student.gender,
    phone: student.phone,
    address: student.address,
    photoUrl: student.photoURL ?? null,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    courses: student.courses,
    source: student.source,
    shift: student.shift,
    shiftTime: student.shiftTime,
    referenceNo: student.referenceNo,
    email: student.email,
  };
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-hairline py-3 last:border-0">
      <span className="font-label text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
        {label}
      </span>
      <span className="max-w-[68%] text-right font-site text-[0.875rem] leading-snug [overflow-wrap:anywhere] text-ink">
        {value || "—"}
      </span>
    </div>
  );
}

const NEXT_STEPS = [
  {
    title: "We reach out in 24–48 hours",
    body: "Our admissions team will call or message you to confirm enrollment and share batch details.",
  },
  {
    title: "Keep your reference number",
    body: "Use it for any communication with our office.",
  },
  {
    title: "Student dashboard",
    body: "Once activated, log in to track status and re-print your form anytime.",
  },
] as const;

export default function AdmissionSuccessPage() {
  const router = useRouter();
  const { submittedStudent } = useAdmissionStore();

  const [showPrint, setShowPrint] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!submittedStudent) {
      router.replace("/admission");
    }
  }, [submittedStudent, router, mounted]);

  if (!mounted || !submittedStudent) return null;

  const student = submittedStudent;
  const printData = buildPrintData(student);
  const firstName = student.fullName.split(" ")[0] ?? "there";

  function handlePrintOpen() {
    setShowPrint(true);
    setHasPrinted(true);
  }

  async function handleCopyRef() {
    try {
      await navigator.clipboard.writeText(student.referenceNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <main className="bg-paper pt-10 pb-20 font-site sm:pt-14 sm:pb-28">
        <div className="container-page">
          <div className="mx-auto max-w-6xl">
            <Breadcrumbs
              className="animate-rise"
              items={[
                { label: "Home", href: "/" },
                { label: "Admission" },
                { label: "Received" },
              ]}
            />

            {/* Hero */}
            <div className="mt-10 mb-12 grid gap-10 lg:mb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end lg:gap-16">
              <div className="max-w-2xl">
                <p
                  className="eyebrow animate-rise flex items-center gap-2"
                  style={{ "--i": 1 } as React.CSSProperties}
                >
                  <CheckCircle2
                    aria-hidden
                    className="h-3.5 w-3.5 text-pine"
                    strokeWidth={1.75}
                  />
                  Application received
                </p>
                <h1
                  className="display animate-rise mt-4 text-[clamp(3rem,7vw,5.5rem)] text-ink"
                  style={{ "--i": 2 } as React.CSSProperties}
                >
                  You&apos;re in the queue, <em>{firstName}.</em>
                </h1>
                <p
                  className="animate-rise mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted"
                  style={{ "--i": 3 } as React.CSSProperties}
                >
                  Your admission form was submitted to{" "}
                  {siteInfo.company.shortName}. Save your reference number and
                  print a copy before you leave this page.
                </p>
              </div>

              <div
                className="animate-rise border border-hairline bg-surface px-6 py-5 sm:px-7"
                style={{ "--i": 4 } as React.CSSProperties}
              >
                <p className="eyebrow">Your reference number</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="font-label text-[1.375rem] tracking-[0.04em] break-all text-ink tabular-nums sm:text-[1.5rem]">
                    {student.referenceNo}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="flex size-10 shrink-0 items-center justify-center border border-hairline bg-paper text-ink-muted outline-none transition-colors duration-300 hover:border-ink/60 hover:text-ink focus-visible:ring-2 focus-visible:ring-clay"
                    aria-label={
                      copied ? "Reference number copied" : "Copy reference number"
                    }
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-pine" strokeWidth={2} />
                    ) : (
                      <Copy className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-[0.75rem] text-ink-muted">
                  Submitted {formatDate(student.createdAt)} · FY{" "}
                  {student.fiscalYear}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12">
              {/* Left column */}
              <div className="flex flex-col gap-10">
                {/* Print CTA — prominent, logic unchanged */}
                <section
                  aria-labelledby="print-heading"
                  className="border border-hairline p-6 sm:p-8"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="eyebrow">Before you go</p>
                      <h2
                        id="print-heading"
                        className="display mt-3 text-4xl text-ink"
                      >
                        Print or save as <em>PDF.</em>
                      </h2>
                      <p className="mt-3 max-w-md text-[0.875rem] leading-relaxed text-ink-muted">
                        Download a copy now. Once you leave this page, printing
                        won&apos;t be available until your student dashboard is
                        activated.
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                      <button
                        type="button"
                        onClick={handlePrintOpen}
                        disabled={hasPrinted}
                        className={admissionPrimaryBtnClass}
                      >
                        <Printer className="h-4 w-4" strokeWidth={1.5} />
                        {hasPrinted ? "Form opened" : "Print / save PDF"}
                      </button>
                      {hasPrinted ? (
                        <button
                          type="button"
                          onClick={handlePrintOpen}
                          className="link-underline text-[0.8125rem] text-ink outline-none"
                        >
                          Open print dialog again
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {hasPrinted ? (
                    <div className="animate-rise mt-6 flex items-start gap-3 border-l-2 border-clay bg-surface px-4 py-3">
                      <AlertTriangle
                        className="mt-0.5 h-4 w-4 shrink-0 text-clay-deep"
                        strokeWidth={1.75}
                      />
                      <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                        You&apos;ve opened the print dialog. Need another copy
                        later? Visit your student dashboard once it&apos;s
                        activated.
                      </p>
                    </div>
                  ) : null}
                </section>

                {/* Next steps */}
                <section aria-labelledby="next-steps-heading">
                  <p id="next-steps-heading" className="eyebrow">
                    What happens next
                  </p>
                  <ol className="mt-5 grid grid-cols-1 border-t border-hairline sm:grid-cols-3">
                    {NEXT_STEPS.map(({ title, body }, index) => (
                      <li
                        key={title}
                        className="border-b border-hairline py-5 sm:border-b-0 sm:py-6 sm:pr-5 sm:not-first:border-l sm:not-first:pl-5"
                      >
                        <p
                          aria-hidden
                          className="font-label text-[0.6875rem] tracking-[0.16em] text-clay-deep tabular-nums"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <p className="mt-3 font-display text-[1.375rem] leading-tight text-ink">
                          {title}
                        </p>
                        <p className="mt-1.5 text-[0.8125rem] leading-relaxed break-words text-ink-muted">
                          {index === 1
                            ? `Use ${student.referenceNo} for any communication with our office.`
                            : body}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>

                <p className={admissionCalloutClass}>
                  Questions about your application? Call{" "}
                  <a
                    href={`tel:${siteInfo.contact.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-1 text-ink tabular-nums underline-offset-4 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {siteInfo.contact.phone}
                  </a>
                </p>
              </div>

              {/* Receipt summary */}
              <aside
                aria-label="Application summary"
                className="border border-hairline lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]"
              >
                <div className="flex items-center gap-4 bg-pine px-5 py-5">
                  {student.photoURL ? (
                    <Image
                      src={student.photoURL}
                      alt={student.fullName}
                      width={52}
                      height={52}
                      className="h-[52px] w-[52px] shrink-0 object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center border border-paper/20">
                      <User className="h-5 w-5 text-paper/60" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-display text-[1.5rem] leading-tight text-paper">
                      {student.fullName}
                    </p>
                    <p className="mt-1 font-label text-[0.625rem] tracking-[0.16em] text-paper/60 uppercase">
                      {capitalize(student.status)} · {capitalize(student.shift)}{" "}
                      shift
                    </p>
                  </div>
                </div>

                <div className="px-5 py-2">
                  <SummaryRow label="Date of birth" value={student.dob} />
                  <SummaryRow label="Phone" value={student.phone} />
                  <SummaryRow label="Email" value={student.email} />
                  <SummaryRow label="Address" value={student.address} />
                  <SummaryRow
                    label="Guardian"
                    value={`${student.guardianName} · ${student.guardianPhone}`}
                  />
                  <SummaryRow
                    label="Courses"
                    value={student.courses.join(", ")}
                  />
                  <SummaryRow
                    label="Shift"
                    value={`${capitalize(student.shift)} · ${student.shiftTime}`}
                  />
                  <SummaryRow
                    label="Submitted"
                    value={formatDate(student.createdAt)}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-hairline bg-surface px-5 py-3">
                  <span className="font-label text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
                    Fiscal year
                  </span>
                  <span className="font-label text-[0.875rem] text-ink tabular-nums">
                    {student.fiscalYear}
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      {showPrint ? (
        <PrintAdmissionForm data={{ ...printData }} onClose={() => setShowPrint(false)} />
      ) : null}
    </>
  );
}
