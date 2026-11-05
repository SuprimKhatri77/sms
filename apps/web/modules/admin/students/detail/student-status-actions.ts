import type { Status } from "./StudentDetail";

export function canPerformStudentActions(status: Status): boolean {
  return status === "active" || status === "completed";
}

export const STUDENT_STATUS_ACTION_TOOLTIP =
  "Set the student status to Active or Completed to use this action.";

export const STUDENT_BALANCE_CLEARED_TOOLTIP =
  "Balance is already cleared. New scholarships and discounts cannot be added.";

export function canAddStudentFinanceAdjustments(
  status: Status,
  balanceDue: number,
): boolean {
  return canPerformStudentActions(status) && balanceDue > 0;
}

export function getStudentFinanceAdjustmentDisabledTooltip(
  status: Status,
  balanceDue: number,
): string | undefined {
  if (!canPerformStudentActions(status)) return STUDENT_STATUS_ACTION_TOOLTIP;
  if (balanceDue <= 0) return STUDENT_BALANCE_CLEARED_TOOLTIP;
  return undefined;
}

export function canChangeCoursesForStatus(status: Status): boolean {
  return status === "pending" || status === "active";
}

// Mirrors the backend checks in ChangeStudentCourses, which stay the source of truth.
export function getCourseChangeBlockedReason({
  status,
  paymentCount,
  discountCount,
  hasScholarship,
  certificateCount,
}: {
  status: Status;
  paymentCount: number;
  discountCount: number;
  hasScholarship: boolean;
  certificateCount: number;
}): string | undefined {
  if (!canChangeCoursesForStatus(status))
    return "Course can only be changed for a pending or active student.";
  if (paymentCount > 0)
    return "Course can't be changed because this student already has payments.";
  if (discountCount > 0)
    return "Course can't be changed because this student already has a discount.";
  if (hasScholarship)
    return "Course can't be changed because this student already has a scholarship.";
  if (certificateCount > 0)
    return "Course can't be changed because this student already has a certificate.";
  return undefined;
}
