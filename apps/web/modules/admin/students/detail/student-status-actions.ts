import type { Status } from "./StudentDetail";

export function canPerformStudentActions(status: Status): boolean {
  return status === "active" || status === "completed";
}

export const STUDENT_STATUS_ACTION_TOOLTIP =
  "Set the student status to Active or Completed to use this action.";
