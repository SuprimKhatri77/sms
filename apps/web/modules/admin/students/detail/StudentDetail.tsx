"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, Printer, Stamp } from "lucide-react";
import {
  AddPayment,
  AddPaymentResponse,
  StudentDetail,
  StudentDiscountResponse,
  StudentEnrolledCourses,
  StudentPaymentDetails,
  StudentScholarshipResponse,
  UpdateStudentStatus,
  UpdateStudentStatusResponse,
} from "@repo/types";
import { AddPaymentModal } from "./AddPaymentModal";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Certificate } from "@/components/certificate/Certificate";
import { printCertificateElement } from "@/components/certificate/printCertificate";
import { getCertificateVerifyUrl } from "@/lib/certificate-url";
import { useIssueCertificate } from "@/hooks/mutations/admin/certificates/useIssueCertificate";
import { useStudentCertificates } from "@/hooks/queries/admin/certificates/useStudentCertificates";
import { siteInfo } from "@/utils/site-info";
import { usePrintInvoice } from "./PrintInvoice";
import { PaymentRow } from "./PaymentRow";
import StudentDetailGrid from "./StudentDetailGrid";
import { StudentDetailHeader } from "./StudentDetailHeader";
import { StudentFinanceBar } from "./StudentFinanceBar";
import { Invoice } from "./Invoice";
import {
  adminPrimaryButtonClass,
  adminPrimaryButtonDisabledClass,
} from "@/components/admin/admin-styles";
import { useAdminRefreshShortcut, useAdminBackShortcut, useAdminPaymentShortcut } from "@/components/admin/admin-shortcut-provider";
import { useAdminRouterRefresh } from "@/hooks/useAdminRouterRefresh";
import { canPerformStudentActions } from "./student-status-actions";
import { cn } from "@/lib/utils";
import { detailPanelClass } from "./detail-styles";

type Props = {
  student: Extract<StudentDetail, { success: true }>["data"];
  courses: Extract<StudentEnrolledCourses, { success: true }>["data"];
  payments: Extract<StudentPaymentDetails, { success: true }>["data"];
  scholarships: Extract<StudentScholarshipResponse, { success: true }>["data"];
  discounts: Extract<StudentDiscountResponse, { success: true }>["data"];
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

const WORKSHOP_TITLE = "Specialty Coffee Brewing";

export default function StudentDetailPage({
  student,
  courses,
  payments,
  scholarships,
  discounts,
}: Props) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showWorkshopCertificate, setShowWorkshopCertificate] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? "");
  const [issuedCertId, setIssuedCertId] = useState<string | null>(null);
  const [issuedForCourseId, setIssuedForCourseId] = useState<string | null>(null);
  const [issuedAt, setIssuedAt] = useState<string | null>(null);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const courseCertRef = useRef<HTMLDivElement>(null);
  const [currentStatus, setCurrentStatus] = useState<Status>(student.status);
  const router = useRouter();

  useAdminRefreshShortcut(useAdminRouterRefresh());
  useAdminBackShortcut(useCallback(() => router.push("/admin/students"), [router]));

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0) / 100;
  const totalFee = courses.reduce((s, c) => s + c.feeAtEnrollment, 0) / 100;
  const discountAmount = discounts.reduce((s, d) => s + d.amount, 0) / 100;
  const scholarshipAmount = scholarships?.amount
    ? scholarships.amount / 100
    : 0;
  const balanceDue = totalFee - totalPaid - discountAmount - scholarshipAmount;

  const paymentDisabled =
    balanceDue <= 0 || !canPerformStudentActions(currentStatus);

  useAdminPaymentShortcut(
    useCallback(() => {
      if (!paymentDisabled) setShowPaymentModal(true);
    }, [paymentDisabled]),
  );

  const { data: certificatesResponse, isLoading: isLoadingCertificate } =
    useStudentCertificates(student.id, showCertificate);

  const certificates = certificatesResponse?.data ?? [];

  useEffect(() => {
    if (courses.length === 0) return;
    if (!courses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId);

  const existingCertificate =
    certificates.find(
      (cert) => cert.type === "normal" && cert.courseId === selectedCourseId,
    ) ?? null;

  const hasIssuedCertificateForSelection =
    !!existingCertificate ||
    (issuedForCourseId === selectedCourseId && !!issuedCertId);

  const certificateId =
    existingCertificate?.id ??
    (issuedForCourseId === selectedCourseId ? issuedCertId : null);

  const previewCourseName =
    existingCertificate?.courseName ?? selectedCourse?.name ?? "";
  const courseQrUrl = certificateId
    ? getCertificateVerifyUrl(certificateId)
    : null;

  const resolvedIssueAt =
    existingCertificate?.issuedAt ??
    (issuedForCourseId === selectedCourseId ? issuedAt : null);

  const issueDate = resolvedIssueAt
    ? new Date(resolvedIssueAt).toLocaleDateString("en-NP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-NP", {
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

  const { mutateAsync: addPayment, isPending: isAddingPayment } = useMutation({
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
  });

  const { handlePrint } = usePrintInvoice({ student, courses, payments });

  const { mutateAsync: issueCertificate, isPending: isIssuingCertificate } =
    useIssueCertificate(student.id);

  useEffect(() => {
    if (!pendingPrint || !courseQrUrl) return;

    let cancelled = false;

    const runPrint = async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      if (cancelled) return;

      const ok = await printCertificateElement(courseCertRef.current);
      if (!ok && !cancelled) {
        toast.error("Could not open the certificate print dialog.");
      }
      setPendingPrint(false);
      setIsIssuing(false);
    };

    void runPrint();

    return () => {
      cancelled = true;
    };
  }, [pendingPrint, courseQrUrl]);

  const handlePrintCertificate = async () => {
    const ok = await printCertificateElement(courseCertRef.current);
    if (!ok) {
      toast.error("Could not open the certificate print dialog.");
    }
  };

  const handleIssueCertificate = async () => {
    if (!selectedCourse) return;

    setIsIssuing(true);
    try {
      const result = await issueCertificate({
        type: "normal",
        courseId: selectedCourse.id,
      });
      setIssuedCertId(result.data.id);
      setIssuedForCourseId(selectedCourse.id);
      setIssuedAt(result.data.issuedAt ?? null);
      setPendingPrint(true);
    } catch {
      setIsIssuing(false);
    }
  };

  const certificateSelectClass =
    "cursor-pointer border border-[rgba(47,78,64,0.18)] bg-white px-3 py-2 font-(family-name:--font-dm-sans) text-xs font-semibold text-(--brand-green) outline-none transition-colors hover:border-(--brand-green)";

  const certificateActionDisabled =
    isIssuing || isIssuingCertificate || pendingPrint || isLoadingCertificate;

  const certificateActionButtonClass = cn(
    adminPrimaryButtonClass,
    adminPrimaryButtonDisabledClass,
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8">
      <AddPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onAdd={(data) => addPayment({ ...data })}
        isAdding={isAddingPayment}
        balanceDue={balanceDue}
      />

      <div className="mx-auto max-w-8xl space-y-5">
        <StudentDetailHeader
          studentId={student.id}
          fullName={student.fullName}
          referenceNo={student.referenceNo}
          email={student.email}
          batch={student.batch}
          shift={student.shift}
          photoUrl={student.photoUrl}
          status={currentStatus}
          balanceDue={balanceDue}
          onAddPayment={() => setShowPaymentModal(true)}
          showInvoice={showInvoice}
          onToggleInvoice={() => setShowInvoice((v) => !v)}
          showCertificate={showCertificate}
          onToggleCertificate={() => setShowCertificate((v) => !v)}
          showWorkshopCertificate={showWorkshopCertificate}
          onToggleWorkshopCertificate={() =>
            setShowWorkshopCertificate((v) => !v)
          }
        />

        <StudentFinanceBar
          totalFee={totalFee}
          totalPaid={totalPaid}
          discountAmount={discountAmount}
          scholarshipAmount={scholarshipAmount}
          balanceDue={balanceDue}
          courseCount={courses.length}
          paymentCount={payments.length}
        />

        {showInvoice ? (
          <div className={detailPanelClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(47,78,64,0.12)] px-5 py-4">
              <h2 className="font-(family-name:--font-lora) text-base font-bold text-(--brand-green)">
                Invoice Preview
              </h2>
              <button
                type="button"
                onClick={handlePrint}
                className={adminPrimaryButtonClass}
              >
                <Printer size={14} />
                Print Invoice
              </button>
            </div>
            <div className="p-5">
              <Invoice
                student={student}
                payments={payments}
                courses={courses}
              />
            </div>
          </div>
        ) : null}

        {showCertificate ? (
          <div className={detailPanelClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(47,78,64,0.12)] px-5 py-4">
              <div>
                <h2 className="font-(family-name:--font-lora) text-base font-bold text-(--brand-green)">
                  Certificate Preview
                </h2>
                <p className="mt-1 font-(family-name:--font-dm-sans) text-[0.72rem] text-[rgba(47,78,64,0.45)]">
                  {hasIssuedCertificateForSelection
                    ? "Certificate issued. Print with verification QR code. Turn off Headers & footers and turn on Background graphics."
                    : "Issue to record the certificate. The verification QR code will appear after a successful issue. Print: turn off Headers & footers, turn on Background graphics."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {courses.length > 0 ? (
                  <select
                    value={selectedCourseId}
                    onChange={(event) =>
                      setSelectedCourseId(event.target.value)
                    }
                    className={certificateSelectClass}
                    aria-label="Select course certificate"
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                ) : null}
                {isLoadingCertificate ? (
                  <button
                    type="button"
                    disabled
                    className={certificateActionButtonClass}
                  >
                    <Loader2 size={14} className="animate-spin" />
                    Loading…
                  </button>
                ) : hasIssuedCertificateForSelection ? (
                  <button
                    type="button"
                    onClick={() => void handlePrintCertificate()}
                    className={certificateActionButtonClass}
                  >
                    <Printer size={14} />
                    Print Certificate
                  </button>
                ) : courses.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => void handleIssueCertificate()}
                    disabled={certificateActionDisabled || !selectedCourse}
                    className={certificateActionButtonClass}
                  >
                    {isIssuing || isIssuingCertificate ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Stamp size={14} />
                    )}
                    {isIssuing || isIssuingCertificate
                      ? "Issuing…"
                      : "Issue Certificate"}
                  </button>
                ) : null}
              </div>
            </div>
            <div className="overflow-x-auto p-5">
              <div style={{ minWidth: 794 }}>
                <Certificate
                  ref={courseCertRef}
                  studentName={student.fullName}
                  referenceNo={student.referenceNo}
                  courses={previewCourseName ? [previewCourseName] : []}
                  issueDate={issueDate}
                  schoolName={siteInfo.company.name}
                  logoUrl={siteInfo.assets.watermarkNoBG}
                  accreditationLogoUrl={siteInfo.assets.watermarkNoBG}
                  footerAddress={siteInfo.contact.address}
                  footerContact={siteInfo.contact.email}
                  qrCodeUrl={courseQrUrl ?? undefined}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Workshop certificate preview — temporarily hidden
        {showWorkshopCertificate ? (
          <div className={detailPanelClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(47,78,64,0.12)] px-5 py-4">
              <div>
                <h2 className="font-(family-name:--font-lora) text-base font-bold text-(--brand-green)">
                  Workshop Certificate Preview
                </h2>
                <p className="mt-1 font-(family-name:--font-dm-sans) text-[0.72rem] text-[rgba(47,78,64,0.45)]">
                  Issue to record the certificate and print with verification QR
                  code. Print: turn off Headers &amp; footers, turn on Background
                  graphics
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleIssueCertificate("workshop")}
                disabled={
                  isIssuingCertificate ||
                  issuingType === "workshop" ||
                  !!pendingPrint
                }
                className={certificateActionButtonClass}
              >
                {issuingType === "workshop" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Stamp size={14} />
                )}
                Issue Certificate
              </button>
            </div>
            <div className="overflow-x-auto p-5">
              <div style={{ minWidth: 794 }}>
                <WorkshopCertificate
                  ref={workshopCertRef}
                  studentName={student.fullName}
                  workshopTitle={WORKSHOP_TITLE}
                  workshopDate="2082-02-01"
                  referenceNo={student.referenceNo}
                  issueDate={issueDate}
                  logoUrl={siteInfo.assets.watermarkNoBG}
                  accreditationLogoUrl={siteInfo.assets.watermarkNoBG}
                  footerAddress={siteInfo.contact.address}
                  footerContact={siteInfo.contact.email}
                  qrCodeUrl={workshopQrUrl ?? undefined}
                />
              </div>
            </div>
          </div>
        ) : null}
        */}

        <StudentDetailGrid
          balanceDue={balanceDue}
          student={student}
          courses={courses}
          payments={payments}
          totalFee={totalFee}
          setShowPaymentModal={setShowPaymentModal}
          PaymentRow={PaymentRow}
          scholarship={scholarships}
          discounts={discounts}
          currentStatus={currentStatus}
          onUpdateStatus={(next, rejectionReason) =>
            updateStatus({ status: next, rejectionReason })
          }
        />
      </div>
    </div>
  );
}
