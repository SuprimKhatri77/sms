import { getActiveCourses } from "@/lib/queries/courses/get-active-courses";
import AdmissionPage from "@/modules/admission/Admission";

export default async function Page() {
  const activeCourses = await getActiveCourses();

  return <AdmissionPage courses={activeCourses} />;
}
