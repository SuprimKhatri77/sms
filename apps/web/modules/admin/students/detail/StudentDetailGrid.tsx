import {
  StudentDetail,
  StudentDiscountResponse,
  StudentEnrolledCourses,
  StudentPaymentDetails,
  StudentScholarshipResponse,
} from "@repo/types";
import { DiscountSection } from "./DiscountSection";
import { ScholarshipSection } from "./ScholarshipSection";
import { MiddleColumn } from "./MiddleColumn";
import { RightColumn } from "./RightColumn";
import { StatusEditor } from "./StatusEditor";
import type { Status } from "./StudentDetail";

type Student = Extract<StudentDetail, { success: true }>["data"];
type Course = Extract<
  StudentEnrolledCourses,
  { success: true }
>["data"][number];
type Payment = Extract<
  StudentPaymentDetails,
  { success: true }
>["data"][number];
type Scholarship = Extract<
  StudentScholarshipResponse,
  { success: true }
>["data"];
type Discount = Extract<
  StudentDiscountResponse,
  { success: true }
>["data"][number];

type PaymentRowProps = {
  payment: {
    id: string | number;
    amount: number;
    addedAt: string;
    remarks?: string | null;
    addedByName?: string;
    paymentMode?: string | null;
  };
  student: {
    referenceNo: string;
    fullName: string;
    phone: string;
    fiscalYear: string;
  };
  receiptNo: number;
};

export function StudentDetailGrid({
  student,
  payments,
  courses,
  totalFee,
  setShowPaymentModal,
  PaymentRow,
  scholarship,
  discounts,
  balanceDue,
  currentStatus,
  onUpdateStatus,
}: {
  student: Student;
  payments: Payment[];
  courses: Course[];
  totalFee: number;
  setShowPaymentModal: (v: boolean) => void;
  PaymentRow: React.ComponentType<PaymentRowProps>;
  scholarship: Scholarship;
  discounts: Discount[];
  balanceDue: number;
  currentStatus: Status;
  onUpdateStatus: (
    next: Status,
    rejectionReason?: string,
  ) => Promise<void> | void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
      <MiddleColumn
        balanceDue={balanceDue}
        student={student}
        payments={payments}
        setShowPaymentModal={setShowPaymentModal}
        PaymentRow={PaymentRow}
        currentStatus={currentStatus}
      />

      <div className="flex flex-col gap-5">
        <StatusEditor current={currentStatus} onUpdate={onUpdateStatus} />

        <RightColumn student={student} courses={courses} totalFee={totalFee} />
        <DiscountSection
          discounts={discounts}
          studentID={student.id}
          currentStatus={currentStatus}
        />
        <ScholarshipSection
          scholarship={scholarship}
          studentID={student.id}
          currentStatus={currentStatus}
        />
      </div>
    </div>
  );
}

export default StudentDetailGrid;
