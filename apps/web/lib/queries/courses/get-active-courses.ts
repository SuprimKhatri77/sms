import { env } from "@/utils/env";
import { CoursesList } from "@repo/types";

export async function getActiveCourses() {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/courses`, {
    method: "GET",
  });

  const data = (await res.json()) as CoursesList;
  if (!res.ok || !data.success)
    throw new Error(!data.success ? data.message : "Failed to fetch courses");

  return data.data;
}
