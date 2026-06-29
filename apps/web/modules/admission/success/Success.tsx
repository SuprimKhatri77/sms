"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Hash,
  Phone,
  Printer,
  User,
} from "lucide-react";
import PrintAdmissionForm, { PrintAdmissionData } from "../PrintAdmissionForm";
import { siteInfo } from "@/utils/site-info";
import { useAdmissionStore } from "@/store/useAdmissionStore";
import { cn } from "@/lib/utils";
import {
  landingContainerClass,
  landingEyebrowClass,
  landingSectionBodyClass,
  landingSectionTitleClass,
} from "@/components/landing/landing-styles";
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
    <div className="flex items-start justify-between gap-4 border-b border-[rgba(47,78,64,0.08)] py-3 last:border-0">
      <span className="font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.42)]">
        {label}
      </span>
      <span className="max-w-[58%] text-right font-[family-name:var(--font-dm-sans)] text-[0.88rem] font-medium leading-snug text-(--brand-green)">
        {value || "—"}
      </span>
    </div>
  );
}

const NEXT_STEPS = [
  {
    icon: Clock,
    title: "We reach out in 24–48 hours",
    body: "Our admissions team will call or message you to confirm enrollment and share batch details.",
  },
  {
    icon: Hash,
    title: "Keep your reference number",
    body: "Use it for any communication with our office.",
  },
  {
    icon: BookOpen,
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
      <main className="min-h-screen bg-(--brand-cream)">
        <header className="sticky top-0 z-20 border-b border-[rgba(47,78,64,0.1)] bg-(--brand-cream)/95 backdrop-blur-sm">
          <div
            className={cn(
              landingContainerClass,
              "flex h-14 items-center justify-between gap-4 px-4 sm:px-6",
            )}
          >
            <Image
              src={siteInfo.assets.noBGLogo}
              alt={siteInfo.company.name}
              width={100}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-[family-name:var(--font-dm-sans)] text-[0.82rem] font-semibold text-[rgba(47,78,64,0.55)] transition-colors hover:text-(--brand-green)"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              Back to home
            </Link>
          </div>
        </header>

        <div className={cn(landingContainerClass, "px-4 pb-16 pt-10 sm:px-6 sm:pt-14")}>
          <div className="mx-auto max-w-6xl">
            {/* Hero */}
            <div className="mb-10 max-w-2xl lg:mb-12">
              <div className="mb-5 inline-flex items-center gap-2 border border-[rgba(194,138,79,0.28)] bg-[rgba(194,138,79,0.08)] px-3 py-1.5 font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-(--brand-brown)">
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                Application received
              </div>
              <h1 className={landingSectionTitleClass}>
                You&apos;re in the queue,{" "}
                <em
                  className="font-medium text-(--brand-brown)"
                  style={{ fontStyle: "italic" }}
                >
                  {firstName}.
                </em>
              </h1>
              <p className={cn(landingSectionBodyClass, "mt-4 max-w-xl")}>
                Your admission form was submitted to {siteInfo.company.shortName}.
                Save your reference number and print a copy before you leave this
                page.
              </p>

              <div className="mt-8 w-full max-w-md border border-[rgba(47,78,64,0.12)] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(47,78,64,0.07)] sm:px-8">
                <p className="font-[family-name:var(--font-dm-sans)] text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[rgba(47,78,64,0.42)]">
                  Your reference number
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <p className="font-[family-name:var(--font-dm-sans)] text-[1.35rem] font-bold tracking-wide text-(--brand-green) sm:text-[1.5rem]">
                    {student.referenceNo}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="flex h-9 w-9 shrink-0 items-center justify-center border border-[rgba(47,78,64,0.12)] text-[rgba(47,78,64,0.45)] transition-colors hover:border-(--brand-brown) hover:text-(--brand-brown)"
                    aria-label="Copy reference number"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    ) : (
                      <Copy className="h-4 w-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
                <p className="mt-2 font-[family-name:var(--font-dm-sans)] text-[0.78rem] text-[rgba(47,78,64,0.45)]">
                  Submitted {formatDate(student.createdAt)} · FY{" "}
                  {student.fiscalYear}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
              {/* Left column */}
              <div className="flex flex-col gap-6">
                {/* Print CTA — prominent, logic unchanged */}
                <div className="relative overflow-hidden border border-[rgba(47,78,64,0.12)] bg-white p-6 shadow-[0_12px_40px_rgba(47,78,64,0.06)] sm:p-8">
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-(--brand-green) via-(--brand-brown) to-(--brand-green)"
                    aria-hidden
                  />
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[rgba(47,78,64,0.08)] text-(--brand-green)">
                        <Printer className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <h2 className="font-[family-name:var(--font-playfair)] text-[1.2rem] font-semibold text-(--brand-green)">
                          Print or save as PDF
                        </h2>
                        <p className="mt-1 max-w-md font-[family-name:var(--font-dm-sans)] text-[0.86rem] leading-relaxed text-[rgba(47,78,64,0.55)]">
                          Download a copy now. Once you leave this page, printing
                          won&apos;t be available until your student dashboard is
                          activated.
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        type="button"
                        onClick={handlePrintOpen}
                        disabled={hasPrinted}
                        className={cn(
                          admissionPrimaryBtnClass,
                          "disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                      >
                        <Printer className="h-4 w-4" strokeWidth={2} />
                        {hasPrinted ? "Form opened" : "Print / save PDF"}
                      </button>
                      {hasPrinted ? (
                        <button
                          type="button"
                          onClick={handlePrintOpen}
                          className="font-[family-name:var(--font-dm-sans)] text-[0.78rem] font-semibold text-[rgba(47,78,64,0.45)] underline-offset-2 hover:text-(--brand-green) hover:underline"
                        >
                          Open print dialog again
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {hasPrinted ? (
                    <div className="mt-5 flex items-start gap-3 border border-amber-200/80 bg-amber-50/80 px-4 py-3">
                      <AlertTriangle
                        className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                        strokeWidth={2}
                      />
                      <p className="font-[family-name:var(--font-dm-sans)] text-[0.8rem] leading-relaxed text-amber-800">
                        You&apos;ve opened the print dialog. Need another copy
                        later? Visit your student dashboard once it&apos;s
                        activated.
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Next steps */}
                <div className="border border-[rgba(47,78,64,0.1)] bg-white p-6 sm:p-8">
                  <p className={cn(landingEyebrowClass, "mb-5")}>
                    What happens next
                  </p>
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {NEXT_STEPS.map(({ icon: Icon, title, body }, index) => (
                      <li
                        key={title}
                        className="border border-[rgba(47,78,64,0.08)] bg-[#faf9f6] p-4"
                      >
                        <div className="mb-3 flex h-9 w-9 items-center justify-center bg-[rgba(47,78,64,0.08)] text-(--brand-green)">
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-[0.88rem] font-semibold text-(--brand-green)">
                          {title}
                        </p>
                        <p className="mt-1.5 font-[family-name:var(--font-dm-sans)] text-[0.8rem] leading-relaxed text-[rgba(47,78,64,0.52)]">
                          {index === 1
                            ? `Use ${student.referenceNo} for any communication with our office.`
                            : body}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className={admissionCalloutClass}>
                  Questions about your application? Call{" "}
                  <a
                    href={`tel:${siteInfo.contact.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-1 font-semibold text-(--brand-green) hover:text-(--brand-brown)"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {siteInfo.contact.phone}
                  </a>
                </p>
              </div>

              {/* Receipt summary */}
              <aside className="overflow-hidden border border-[rgba(47,78,64,0.12)] bg-white shadow-[0_12px_40px_rgba(47,78,64,0.06)] lg:sticky lg:top-20">
                <div className="flex items-center gap-4 bg-(--brand-green) px-5 py-5">
                  {student.photoURL ? (
                    <Image
                      src={student.photoURL}
                      alt={student.fullName}
                      width={52}
                      height={52}
                      className="h-[52px] w-[52px] shrink-0 object-cover ring-2 ring-white/20"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center border border-white/20 bg-white/10">
                      <User className="h-5 w-5 text-white/60" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-[family-name:var(--font-dm-sans)] text-[0.95rem] font-semibold text-white">
                      {student.fullName}
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-[0.75rem] text-white/55">
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

                <div className="mx-5 mb-5 flex items-center justify-between border border-[rgba(47,78,64,0.1)] bg-[#faf9f6] px-4 py-3">
                  <span className="font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.42)]">
                    Fiscal year
                  </span>
                  <span className="font-[family-name:var(--font-dm-sans)] text-[0.88rem] font-semibold text-(--brand-green)">
                    {student.fiscalYear}
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <footer className="border-t border-[rgba(47,78,64,0.08)] bg-white/70">
          <div
            className={cn(
              landingContainerClass,
              "flex flex-col items-center justify-between gap-2 px-4 py-5 font-[family-name:var(--font-dm-sans)] text-[0.75rem] text-[rgba(47,78,64,0.4)] sm:flex-row sm:px-6",
            )}
          >
            <span>
              {siteInfo.company.name} · PAN {siteInfo.company.panNo}
            </span>
            <span>
              {siteInfo.contact.address} · {siteInfo.contact.phone}
            </span>
          </div>
        </footer>
      </main>

      {showPrint ? (
        <PrintAdmissionForm data={{ ...printData }} onClose={() => setShowPrint(false)} />
      ) : null}
    </>
  );
}
