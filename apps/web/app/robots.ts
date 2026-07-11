import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/courses/"],
        disallow: [
          "/admin",
          "/dashboard",
          "/auth",
          "/admission",
          "/certificates",
          "/api",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl(),
  };
}
