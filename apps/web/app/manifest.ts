import type { MetadataRoute } from "next";
import { siteInfo } from "@/utils/site-info";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteInfo.company.shortName,
    short_name: "Brew & Bake",
    description: siteInfo.company.tagline,
    start_url: "/",
    display: "browser",
    background_color: "#fbfaf7",
    theme_color: "#fbfaf7",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
