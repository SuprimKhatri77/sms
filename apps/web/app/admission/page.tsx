export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/lib/queries/auth/get-current-user";
import { getActiveCourses } from "@/lib/queries/courses/get-active-courses";
import { getAdmissionStatus } from "@/lib/queries/student/get-admission-status";
import AdmissionPage from "@/modules/admission/Admission";
import AlreadySubmitted from "@/modules/admission/AlreadySubmitted";

export default async function Page() {
  const [activeCourses, admissionStatus, user] = await Promise.all([
    getActiveCourses(),
    getAdmissionStatus(),
    getCurrentUser(),
  ]);
  if (admissionStatus.data.exists) {
    return (
      <AlreadySubmitted
        studentName={admissionStatus.data.fullName}
        submittedAt={String(admissionStatus.data.createdAt)}
        status={admissionStatus.data.status}
      />
    );
  }

  return <AdmissionPage courses={activeCourses} defaultName={user?.name} />;
}
