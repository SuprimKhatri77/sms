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
    title: "Best Barista & Bakery School in Butwal",
    description:
      "Barista, bakery, bartending, and sushi training in Kalikanagar, Rupandehi.",
    footer: `${siteInfo.contact.address} · Admissions Open`,
  });
}
