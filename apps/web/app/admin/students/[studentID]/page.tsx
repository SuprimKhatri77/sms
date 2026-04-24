import { getStudentDetails } from "@/lib/queries/admin/students/get-student-detail";
import { getStudentEnrolledCourses } from "@/lib/queries/admin/students/get-student-enrolled-courses";
import { getStudentPaymentDetails } from "@/lib/queries/admin/students/get-student-payment-details";
import StudentDetailPage from "@/modules/admin/students/detail/StudentDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ studentID: string }>;
}) {
  console.log("in the /admin/students/:id route");
  const { studentID } = await params;
  if (!studentID) {
    return (
      <div>
        <h1>Missing student ID</h1>
      </div>
    );
  }

  const [student, courses, payments] = await Promise.all([
    getStudentDetails(studentID),
    getStudentEnrolledCourses(studentID),
    getStudentPaymentDetails(studentID),
  ]);

  return (
    <StudentDetailPage
      student={student}
      courses={courses}
      payments={payments}
    />
  );
}
