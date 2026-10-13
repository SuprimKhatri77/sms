import { siteInfo } from "@/utils/site-info";
import {
  createOgImage,
  ogImageContentType,
  ogImageSize,
} from "@/lib/og-image";

export const alt = `${siteInfo.company.shortName} — ${siteInfo.company.tagline}`;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image() {
  return createOgImage({
    eyebrow: "Barista & bakery academy · Butwal",
    title: { lead: "Brew. Bake.", em: "Build a career." },
    description:
      "Hands-on barista, bakery and bartending training in Kalikanagar, Rupandehi.",
    detail: siteInfo.admission.cycleLabel,
    photo:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1600&auto=format&fit=crop",
  });
}
