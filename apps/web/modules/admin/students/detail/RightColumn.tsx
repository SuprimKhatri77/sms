"use client";

import { useState } from "react";
import { StudentDetail, StudentEnrolledCourses } from "@repo/types";
import { SectionCard } from "./shared/SectionCard";
import { EditIconBtn } from "./shared/EditIconButton";
import { AlertCircle, BookOpen, Hash } from "lucide-react";
import { detailInsetClass, detailLabelClass, detailValueClass } from "./detail-styles";
import { formatNpr } from "../shared/student-utils";
import { ChangeCoursesModal } from "./ChangeCoursesModal";
import type { Status } from "./StudentDetail";
import {
  canChangeCoursesForStatus,
  getCourseChangeBlockedReason,
} from "./student-status-actions";
import { useStudentCertificates } from "@/hooks/queries/admin/certificates/useStudentCertificates";

type Student = Extract<StudentDetail, { success: true }>["data"];
type Course = Extract<
  StudentEnrolledCourses,
  { success: true }
>["data"][number];

export function RightColumn({
  courses,
  totalFee,
  student,
  paymentCount,
  discountCount,
  hasScholarship,
  currentStatus,
}: {
  courses: Course[];
  totalFee: number;
  student: Student;
  paymentCount: number;
  discountCount: number;
  hasScholarship: boolean;
  currentStatus: Status;
}) {
  const [showChangeCourses, setShowChangeCourses] = useState(false);

  const { data: certificatesResponse } = useStudentCertificates(
    student.id,
    canChangeCoursesForStatus(currentStatus),
  );

  const courseChangeBlockedReason = getCourseChangeBlockedReason({
    status: currentStatus,
    paymentCount,
    discountCount,
    hasScholarship,
    certificateCount: certificatesResponse?.data?.length ?? 0,
  });

  return (
    <div className="flex flex-col gap-5">
      {showChangeCourses ? (
        <ChangeCoursesModal
          studentId={student.id}
          currentCourses={courses}
          onClose={() => setShowChangeCourses(false)}
        />
      ) : null}

      <SectionCard
        title="Enrolled Courses"
        icon={BookOpen}
        action={
          <EditIconBtn
            onClick={() => setShowChangeCourses(true)}
            disabled={!!courseChangeBlockedReason}
            disabledTooltip={courseChangeBlockedReason}
          />
        }
      >
        <div className="flex flex-col gap-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`flex items-center justify-between px-4 py-3 ${detailInsetClass}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 bg-(--brand-brown)" />
                <span className={detailValueClass}>{course.name}</span>
              </div>
              <span className="font-(family-name:--font-dm-sans) text-sm font-semibold tabular-nums text-(--brand-green)">
                {formatNpr(course.feeAtEnrollment / 100)}
              </span>
            </div>
          ))}
          <div className="mt-1 flex items-center justify-between border-t border-[rgba(47,78,64,0.12)] pt-3">
            <span className={detailLabelClass}>Total</span>
            <span className="font-(family-name:--font-lora) text-base font-bold text-(--brand-green)">
              {formatNpr(totalFee)}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Enrollment Details" icon={Hash}>
        <div className="flex flex-col gap-3">
          {[
            { label: "Fiscal Year", value: student.fiscalYear },
            { label: "Serial No", value: `#${student.serialNo}` },
            {
              label: "Enrolled On",
              value: new Date(student.createdAt).toLocaleDateString("en-NP", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <span className={detailLabelClass}>{label}</span>
              <span className={detailValueClass}>{value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {student.notes ? (
        <SectionCard title="Admin Notes" icon={AlertCircle}>
          <p className="border border-amber-200 bg-amber-50 px-4 py-3 font-(family-name:--font-dm-sans) text-sm leading-relaxed text-amber-900">
            {student.notes}
          </p>
        </SectionCard>
      ) : null}
    </div>
  );
}
