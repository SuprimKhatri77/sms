import { listedCourses } from "@/utils/mock";
import { siteInfo } from "@/utils/site-info";
import {
  createOgImage,
  ogImageContentType,
  ogImageSize,
} from "@/lib/og-image";

export const alt = `Courses at ${siteInfo.company.shortName}, Butwal`;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image() {
  return createOgImage({
    eyebrow: "Programs · Butwal",
    title: { lead: "Learn a", em: "craft." },
    description:
      "Four-week barista, bakery and bartending courses, taught by working professionals.",
    detail: `${listedCourses.length} courses`,
    photo:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1600&auto=format&fit=crop",
  });
}
