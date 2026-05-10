"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  User,
  Users,
  BookOpen,
  CreditCard,
  Plus,
  Printer,
  CalendarDays,
  Hash,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  AddPayment,
  AddPaymentResponse,
  StudentDetail,
  StudentEnrolledCourses,
  StudentPaymentDetails,
  UpdateStudentStatus,
  UpdateStudentStatusResponse,
} from "@repo/types";
import { StudentAvatar } from "./StudentAvatar";
import { AddPaymentModal } from "./AddPaymentModal";
import { StatusEditor } from "./StatusEditor";
import { Invoice } from "./Invoice";
import { SectionCard } from "./SectionCard";
import { InfoRow } from "./InfoRow";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Certificate } from "@/components/certificate/Certificate";
import { siteInfo } from "@/utils/site-info";

type Props = {
  student: Extract<StudentDetail, { success: true }>["data"];
  courses: Extract<StudentEnrolledCourses, { success: true }>["data"];
  payments: Extract<StudentPaymentDetails, { success: true }>["data"];
};

export type Status = "pending" | "active" | "completed" | "rejected";

export const STATUS_META: Record<
  Status,
  { label: string; classes: string; dotClass: string; ringClass: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-400",
    ringClass: "ring-amber-300",
  },
  active: {
    label: "Active",
    classes: "bg-green-50 text-green-700 border-green-200",
    dotClass: "bg-green-400",
    ringClass: "ring-green-300",
  },
  completed: {
    label: "Completed",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-400",
    ringClass: "ring-blue-300",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-red-50 text-red-700 border-red-200",
    dotClass: "bg-red-400",
    ringClass: "ring-red-300",
  },
};

export default function StudentDetailPage({
  student,
  courses,
  payments,
}: Props) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status>(student.status);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  console.log("user: ", user);

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0) / 100;
  const totalFee = courses.reduce((s, c) => s + c.fee, 0) / 100;
  const balance = totalFee - totalPaid;
  const claimedAmount = student.claimedAmount / 100;
  const issueDate = new Date().toLocaleDateString("en-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async (data: UpdateStudentStatus) => {
      const res = await api.put<UpdateStudentStatusResponse>(
        `/admin/students/${student.id}/status`,
        data,
      );
      return res.data;
    },
    onMutate: ({ status }) => {
      setCurrentStatus(status);
    },
    onSuccess: (result) => {
      toast.success(result.message);
      router.refresh();
    },
    onError: (error) => {
      setCurrentStatus(student.status);
      toast.error(error.message);
    },
  });

  const { mutate: addPayment } = useMutation({
    mutationFn: async (data: AddPayment) => {
      const res = await api.post<AddPaymentResponse>(
        `/admin/students/${student.id}/payments`,
        data,
      );
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePrint = () => {
    const totalPaidRaw = payments.reduce((s, p) => s + p.amount, 0) / 100;
    const totalFeeRaw = courses.reduce((s, c) => s + c.fee, 0) / 100;
    const balanceRaw = totalFeeRaw - totalPaidRaw;

    const rows = {
      courses: courses
        .map(
          (c) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#2d4a3e;">${c.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#2d4a3e;text-align:right;">NPR ${c.fee.toLocaleString()}</td>
      </tr>`,
        )
        .join(""),
      payments: payments
        .map(
          (p) => `
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#666;">
          ${new Date(p.addedAt).toLocaleDateString("en-NP", { day: "2-digit", month: "short", year: "numeric" })}
        </td>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#666;">${p.remarks ?? "—"}</td>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#2d4a3e;text-align:right;font-weight:600;">NPR ${(p.amount / 100).toLocaleString()}</td>
      </tr>`,
        )
        .join(""),
    };

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>Invoice – ${student.referenceNo}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#2f4e40;padding:24px;max-width:520px;margin:0 auto;}@media print{body{padding:12mm;}@page{margin:10mm;size:A5 portrait;}}.divider{height:1px;background:#efe8dd;margin:16px 0;}table{width:100%;border-collapse:collapse;}th{text-align:left;font-size:9px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#9a8d7c;padding-bottom:8px;border-bottom:1px solid #efe8dd;}th.right{text-align:right;}</style>
</head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;">
  <div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
      <div style="width:38px;height:38px;border-radius:10px;overflow:hidden;border:1px solid rgba(47,78,64,0.18);background:#fff;display:flex;align-items:center;justify-content:center;">
        <img src="/assets/watermark.png" alt="Brew & Bake" style="width:30px;height:30px;object-fit:contain;display:block;" />
      </div>
      <span style="font-size:16px;font-weight:800;color:#2f4e40;letter-spacing:0.02em;">Brew & Bake Academy</span>
    </div>
    <p style="font-size:12px;color:#999;margin-left:48px;">${siteInfo.contact.address} · ${siteInfo.contact.email}</p>
  </div>
  <div style="text-align:right;">
    <p style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#999;margin-bottom:4px;">Invoice</p>
    <p style="font-size:13px;font-weight:700;color:#2f4e40;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${student.referenceNo}</p>
    <p style="font-size:12px;color:#999;margin-top:2px;">${new Date().toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>
</div>
<div class="divider"></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 32px;margin-bottom:28px;">
  ${[
    ["Student", student.fullName],
    ["Phone", student.phone],
    ["Fiscal Year", student.fiscalYear],
    ["Status", STATUS_META[currentStatus].label],
  ]
    .map(
      ([l, v]) =>
        `<div><p style="font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#aaa;margin-bottom:3px;">${l}</p><p style="font-size:13px;font-weight:600;color:#2d4a3e;">${v}</p></div>`,
    )
    .join("")}
</div>
<div class="divider"></div>
<p style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#aaa;margin-bottom:10px;">Enrolled Courses</p>
<table style="margin-bottom:8px;"><thead><tr><th>Course</th><th class="right">Fee</th></tr></thead><tbody>${rows.courses}</tbody>
<tfoot><tr><td style="padding-top:12px;font-size:13px;font-weight:700;color:#2d4a3e;">Total Fee</td><td style="padding-top:12px;font-size:13px;font-weight:700;color:#2d4a3e;text-align:right;">NPR ${totalFeeRaw.toLocaleString()}</td></tr></tfoot></table>
<div class="divider"></div>
<p style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#aaa;margin-bottom:10px;">Payment History</p>
<table style="margin-bottom:8px;"><thead><tr><th>Date</th><th>Remarks</th><th class="right">Amount</th></tr></thead><tbody>${rows.payments}</tbody></table>
<div class="divider"></div>
<div style="background:#f7f5f2;border-radius:12px;padding:20px 24px;">
  <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;"><span style="color:rgba(47,78,64,0.65);">Total Fee</span><span style="font-weight:700;color:#2f4e40;">NPR ${totalFeeRaw.toLocaleString()}</span></div>
  <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;"><span style="color:rgba(47,78,64,0.65);">Total Paid</span><span style="font-weight:700;color:#2f4e40;">NPR ${totalPaidRaw.toLocaleString()}</span></div>
  <div style="height:1px;background:#e6ddcf;margin:8px 0;"></div>
  <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;"><span style="font-weight:900;color:#2f4e40;">Balance Due</span><span style="font-weight:900;color:${balanceRaw > 0 ? "#dc2626" : "#16a34a"};">NPR ${Math.abs(balanceRaw).toLocaleString()}${balanceRaw === 0 ? " (Cleared)" : ""}</span></div>
</div>
<p style="margin-top:36px;text-align:center;font-size:11px;color:#bbb;">Thank you for choosing Brew & Bake Academy &nbsp;·&nbsp; This is a computer-generated invoice</p>
</body></html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f4f1ec] px-4 py-8 sm:px-6 lg:px-8">
      {showPaymentModal && (
        <AddPaymentModal
          onClose={() => setShowPaymentModal(false)}
          onAdd={(data) => addPayment({ ...data })}
        />
      )}

      <div className="mx-auto max-w-5xl">
        {/* ── Top bar ── */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          {/* LEFT: back + avatar + name */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/students"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#2d4a3e]/15 bg-white transition-all hover:border-[#2d4a3e]/30 hover:bg-[#2d4a3e]/5"
            >
              <ArrowLeft className="h-4 w-4 text-[#2d4a3e]" strokeWidth={2} />
            </Link>

            {/* Avatar */}
            <StudentAvatar
              imageUrl={student.photoUrl}
              fullName={student.fullName}
              status={currentStatus}
            />

            {/* Name + ref */}
            <div>
              <h1
                className="text-[1.4rem] font-bold leading-tight text-[#2d4a3e]"
                style={{ fontFamily: "var(--font-lora)" }}
              >
                {student.fullName}
              </h1>
              <p
                className="font-mono text-[0.78rem] text-[#2d4a3e]/45"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {student.referenceNo}
              </p>
            </div>
          </div>

          {/* RIGHT: action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2d4a3e] px-4 py-2 text-[0.85rem] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(45,74,62,0.25)]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Add Payment
            </button>
            <button
              onClick={() => setShowInvoice(!showInvoice)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#2d4a3e]/15 bg-white px-4 py-2 text-[0.85rem] font-medium text-[#2d4a3e] transition-all hover:border-[#2d4a3e]/30 hover:bg-[#2d4a3e]/5"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <Printer className="h-3.5 w-3.5" strokeWidth={1.75} />
              {showInvoice ? "Hide Invoice" : "View Invoice"}
            </button>
            <button
              onClick={() => setShowCertificate((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#c28a4f]/25 bg-white px-4 py-2 text-[0.85rem] font-medium text-[#7a4e24] transition-all hover:border-[#c28a4f]/40 hover:bg-[#c28a4f]/10"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <Printer className="h-3.5 w-3.5" strokeWidth={1.75} />
              {showCertificate ? "Hide Certificate" : "Issue Certificate"}
            </button>
          </div>
        </div>

        {/* ── Status editor card ── */}
        <div className="mb-6 rounded-2xl border border-black/6 bg-white px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="shrink-0 text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/40"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Student Status
            </span>
            <StatusEditor
              current={currentStatus}
              onUpdate={(next) => updateStatus({ status: next })}
            />
          </div>
        </div>

        {/* ── Summary stat row ── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total Fee",
              value: `NPR ${totalFee.toLocaleString()}`,
              sub: `${courses.length} course${courses.length !== 1 ? "s" : ""}`,
            },
            {
              label: "Total Paid",
              value: `NPR ${totalPaid.toLocaleString()}`,
              sub: `${payments.length} payment${payments.length !== 1 ? "s" : ""}`,
            },
            {
              label: "Balance Due",
              value: `NPR ${Math.abs(balance).toLocaleString()}`,
              sub:
                balance > 0
                  ? "outstanding"
                  : balance === 0
                    ? "cleared"
                    : "overpaid",
            },
            {
              label: "Claimed",
              value: `NPR ${claimedAmount.toLocaleString()}`,
              sub: "by student",
            },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="rounded-xl border border-black/6 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            >
              <p
                className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/40"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {label}
              </p>
              <p
                className="text-[1.05rem] font-bold text-[#2d4a3e]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {value}
              </p>
              <p
                className="mt-0.5 text-[0.72rem] text-[#2d4a3e]/40"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Invoice preview ── */}
        {showInvoice && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2
                className="text-[0.9rem] font-semibold text-[#2d4a3e]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Invoice Preview
              </h2>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#e8552a] px-4 py-2 text-[0.82rem] font-semibold text-white shadow-[0_4px_12px_rgba(232,85,42,0.3)] transition-all hover:-translate-y-0.5"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <Printer className="h-3.5 w-3.5" strokeWidth={2} />
                Print Invoice
              </button>
            </div>

            <Invoice student={student} payments={payments} courses={courses} />
          </div>
        )}

        {/* ── Certificate preview ── */}
        {showCertificate && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2
                className="text-[0.9rem] font-semibold text-[#2d4a3e]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Certificate Preview
              </h2>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#c28a4f] px-4 py-2 text-[0.82rem] font-semibold text-white shadow-[0_4px_12px_rgba(194,138,79,0.28)] transition-all hover:-translate-y-0.5"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <Printer className="h-3.5 w-3.5" strokeWidth={2} />
                Print Certificate
              </button>
            </div>

            <div className="overflow-x-auto">
              <div style={{ minWidth: 794 }}>
                <Certificate
                  studentName={student.fullName}
                  referenceNo={student.referenceNo}
                  courses={courses.map((c) => c.name)}
                  issueDate={issueDate}
                  schoolName={siteInfo.company.name}
                  logoUrl="/assets/watermark-no-bg.png"
                  directorSignatureUrl="/assets/logo.png"
                  headSignatureUrl="/assets/logo.png"
                  accreditationLogoUrl="/assets/watermark-no-bg.png"
                  footerAddress={siteInfo.contact.address}
                  footerContact={siteInfo.contact.email}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Left col */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {/* Personal info */}
            <SectionCard title="Personal Information" icon={User}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow
                  label="Full Name"
                  value={student.fullName}
                  icon={User}
                />
                <InfoRow
                  label="Date of Birth"
                  value={new Date(student.dob).toLocaleDateString("en-NP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  icon={CalendarDays}
                />
                <InfoRow label="Gender" value={student.gender} icon={User} />
                <InfoRow label="Phone" value={student.phone} icon={Phone} />
                <InfoRow
                  label="Email"
                  value={student.email ?? "Not provided"}
                  icon={Mail}
                />
                <InfoRow label="Source" value={student.source} icon={Hash} />
                <div className="sm:col-span-2">
                  <InfoRow
                    label="Address"
                    value={student.address}
                    icon={MapPin}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Guardian */}
            <SectionCard title="Guardian Information" icon={Users}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow
                  label="Guardian Name"
                  value={student.guardianName}
                  icon={User}
                />
                <InfoRow
                  label="Guardian Phone"
                  value={student.guardianPhone}
                  icon={Phone}
                />
              </div>
            </SectionCard>

            {/* Payments */}
            <SectionCard title="Payment History" icon={CreditCard}>
              <div className="mb-4 flex items-center justify-between">
                <p
                  className="text-[0.82rem] text-[#2d4a3e]/50"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {payments.length} payment{payments.length !== 1 ? "s" : ""}{" "}
                  recorded
                </p>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d4a3e] px-3 py-1.5 text-[0.78rem] font-semibold text-white transition-all hover:opacity-90"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  <Plus className="h-3 w-3" strokeWidth={2.5} />
                  Add
                </button>
              </div>
              {payments.length === 0 ? (
                <p
                  className="py-6 text-center text-[0.85rem] text-[#2d4a3e]/35"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  No payments recorded yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-88 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#2d4a3e]/20 scrollbar-track-transparent">
                  {" "}
                  {[...payments].reverse().map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-[#2d4a3e]/08 bg-[#f4f1ec]/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                          <CheckCircle2
                            className="h-4 w-4 text-green-500"
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <p
                            className="text-[0.88rem] font-medium text-[#2d4a3e]"
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          >
                            NPR {(p.amount / 100).toLocaleString()}
                          </p>
                          <p
                            className="text-[0.75rem] text-[#2d4a3e]/45"
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          >
                            {p.remarks ?? "Payment"} ·{" "}
                            {new Date(p.addedAt).toLocaleDateString("en-NP", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-[0.72rem] text-[#2d4a3e]/35"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        by {p.addedByName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Right col */}
          <div className="flex flex-col gap-5">
            {/* Courses */}
            <SectionCard title="Enrolled Courses" icon={BookOpen}>
              <div className="flex flex-col gap-3">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-[#2d4a3e]/08 bg-[#f4f1ec]/50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-[#e8552a]" />
                      <span
                        className="text-[0.9rem] font-medium text-[#2d4a3e]"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        {c.name}
                      </span>
                    </div>
                    <span
                      className="text-[0.82rem] font-semibold text-[#2d4a3e]"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      NPR {(c.fee / 100).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between border-t border-[#2d4a3e]/08 pt-3">
                  <span
                    className="text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-[#2d4a3e]/50"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-[0.95rem] font-bold text-[#2d4a3e]"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    NPR {totalFee.toLocaleString()}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Enrollment meta */}
            <SectionCard title="Enrollment Details" icon={Hash}>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Fiscal Year", value: student.fiscalYear },
                  { label: "Serial No", value: `#${student.serialNo}` },
                  {
                    label: "Enrolled On",
                    value: new Date(student.createdAt).toLocaleDateString(
                      "en-NP",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    ),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span
                      className="text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-[#2d4a3e]/40"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-[0.88rem] font-medium text-[#2d4a3e]"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Notes */}
            {student.notes && (
              <SectionCard title="Admin Notes" icon={AlertCircle}>
                <p
                  className="rounded-xl bg-amber-50 px-4 py-3 text-[0.85rem] leading-[1.6] text-amber-800"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {student.notes}
                </p>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
