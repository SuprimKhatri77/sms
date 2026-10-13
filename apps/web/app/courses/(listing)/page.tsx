import type { Metadata } from "next";
import { coursesMetadata } from "@/lib/seo";
import { getCourseFees } from "@/modules/courses/course-fees";
import {
  CoursesListing,
  isListedCategory,
} from "@/modules/courses/CoursesListing";

export const metadata: Metadata = coursesMetadata;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const { type } = await searchParams;
  // Unknown or repeated ?type= values fall back to every course.
  const category = isListedCategory(type) ? type : null;
  const fees = await getCourseFees();

  return <CoursesListing category={category} fees={fees} />;
}
