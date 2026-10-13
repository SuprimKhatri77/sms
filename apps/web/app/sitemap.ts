import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { courses } from "@/utils/mock";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/courses"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...courses.map((course) => ({
      url: absoluteUrl(`/courses/${course.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
