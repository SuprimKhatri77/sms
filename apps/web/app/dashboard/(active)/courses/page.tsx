import { EnrolledCourses } from "@/components/student/dashboard/EnrolledCourses";
import { DashboardPageShell } from "@/components/student/dashboard/DashboardPageShell";

export default function CoursesPage() {
  return (
    <DashboardPageShell
      title="Courses"
      description="Programs you are currently enrolled in"
    >
      <EnrolledCourses />
    </DashboardPageShell>
  );
}
