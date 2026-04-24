import { env } from "@/utils/env";
import { getAllCookies } from "@/utils/get-all-cookies";
import { StudentEnrolledCourses } from "@repo/types";

export async function getStudentEnrolledCourses(studentID: string) {
  const res = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/api/v1/admin/students/${studentID}/courses`,
    {
      method: "GET",
      headers: {
        Cookie: await getAllCookies(),
      },
    },
  );

  const data = (await res.json()) as StudentEnrolledCourses;
  if (!res.ok || !data || !data.success) {
    throw new Error(`${!data.success ? data.message : "Something went wrong"}`);
  }

  return data.data;
}
