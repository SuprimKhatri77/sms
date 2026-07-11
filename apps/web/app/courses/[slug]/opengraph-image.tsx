import { getCourseSeo } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/utils/mock";
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

  const seo = getCourseSeo(slug);

  return createOgImage({
    eyebrow: `${course.duration} · Butwal`,
    title: seo?.title ?? course.course,
    description: seo?.description ?? course.shortDescription,
    footer: `${siteInfo.company.shortName} · ${siteInfo.contact.address}`,
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
