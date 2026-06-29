"use client";

import { useRef, useState } from "react";
import { Printer } from "lucide-react";
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
import { siteInfo } from "@/utils/site-info";
import { usePrintInvoice } from "./PrintInvoice";
import { PaymentRow } from "./PaymentRow";
import { WorkshopCertificate } from "@/components/certificate/WorkshopCertificate";
import StudentDetailGrid from "./StudentDetailGrid";
import { StudentDetailHeader } from "./StudentDetailHeader";
import { StudentFinanceBar } from "./StudentFinanceBar";
import { Invoice } from "./Invoice";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
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
  const courseCertRef = useRef<HTMLDivElement>(null);
  const workshopCertRef = useRef<HTMLDivElement>(null);
  const [currentStatus, setCurrentStatus] = useState<Status>(student.status);
  const router = useRouter();

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0) / 100;
  const totalFee = courses.reduce((s, c) => s + c.feeAtEnrollment, 0) / 100;
  const discountAmount = discounts.reduce((s, d) => s + d.amount, 0) / 100;
  const scholarshipAmount = scholarships?.amount
    ? scholarships.amount / 100
    : 0;
  const balanceDue = totalFee - totalPaid - discountAmount - scholarshipAmount;

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
              <h2 className="font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
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
              <Invoice student={student} payments={payments} courses={courses} />
            </div>
          </div>
        ) : null}

        {showCertificate ? (
          <div className={detailPanelClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(47,78,64,0.12)] px-5 py-4">
              <div>
                <h2 className="font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
                  Certificate Preview
                </h2>
                <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[0.72rem] text-[rgba(47,78,64,0.45)]">
                  Print: turn off Headers &amp; footers, turn on Background graphics
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void printCertificateElement(courseCertRef.current).then(
                    (ok) => {
                      if (!ok) {
                        toast.error(
                          "Open a certificate preview before printing.",
                        );
                      }
                    },
                  );
                }}
                className={adminPrimaryButtonClass}
              >
                <Printer size={14} />
                Print Certificate
              </button>
            </div>
            <div className="overflow-x-auto p-5">
              <div style={{ minWidth: 1123 }}>
                <Certificate
                  ref={courseCertRef}
                  studentName={student.fullName}
                  referenceNo={student.referenceNo}
                  courses={courses.map((c) => c.name)}
                  issueDate={issueDate}
                  schoolName={siteInfo.company.name}
                  logoUrl="/assets/watermark-no-bg.png"
                  accreditationLogoUrl="/assets/watermark-no-bg.png"
                  footerAddress={siteInfo.contact.address}
                  footerContact={siteInfo.contact.email}
                />
              </div>
            </div>
          </div>
        ) : null}

        {showWorkshopCertificate ? (
          <div className={detailPanelClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(47,78,64,0.12)] px-5 py-4">
              <div>
                <h2 className="font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
                  Workshop Certificate Preview
                </h2>
                <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[0.72rem] text-[rgba(47,78,64,0.45)]">
                  Print: turn off Headers &amp; footers, turn on Background graphics
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void printCertificateElement(workshopCertRef.current).then(
                    (ok) => {
                      if (!ok) {
                        toast.error(
                          "Open a certificate preview before printing.",
                        );
                      }
                    },
                  );
                }}
                className={adminPrimaryButtonClass}
              >
                <Printer size={14} />
                Print Certificate
              </button>
            </div>
            <div className="overflow-x-auto p-5">
              <div style={{ minWidth: 1123 }}>
                <WorkshopCertificate
                  ref={workshopCertRef}
                  studentName={student.fullName}
                  workshopTitle="Specialty Coffee Brewing"
                  workshopDate="2082-02-01"
                  referenceNo={student.referenceNo}
                  issueDate={issueDate}
                  logoUrl={siteInfo.assets.greenBrownNoBG}
                  accreditationLogoUrl="/assets/watermark-no-bg.png"
                  footerAddress={siteInfo.contact.address}
                  footerContact={siteInfo.contact.email}
                />
              </div>
            </div>
          </div>
        ) : null}

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
