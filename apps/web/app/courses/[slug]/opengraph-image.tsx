import { notFound } from "next/navigation";
import { splitTitle } from "@/lib/seo";
import { courseCategories, getCourseBySlug } from "@/utils/mock";
import { siteInfo } from "@/utils/site-info";
import {
  createOgImage,
  ogImageContentType,
  ogImageSize,
} from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const { lead, last } = splitTitle(course.course);

  return createOgImage({
    eyebrow: `${courseCategories[course.category]} course · Butwal`,
    title: { lead, em: `${last}.` },
    description: course.shortDescription,
    detail: `${course.duration} · ${course.difficulty}`,
    photo: course.videoPlaceholder,
  });
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    return [];
  }

  return [
    {
      id: slug,
      alt: `${course.course} at ${siteInfo.company.shortName}`,
      size: ogImageSize,
      contentType: ogImageContentType,
    },
  ];
}
