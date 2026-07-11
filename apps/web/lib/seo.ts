import type { Metadata } from "next";
import { siteInfo } from "@/utils/site-info";
import type { CourseDetail } from "@/utils/mock";

const LOCATION = {
  city: "Butwal",
  district: "Rupandehi",
  country: "Nepal",
  label: "Butwal, Rupandehi",
} as const;

export const SEO_KEYWORDS = [
  siteInfo.company.shortName,
  siteInfo.company.name,
  "best barista school in Butwal",
  "barista school Butwal",
  "barista training Butwal",
  "coffee school Butwal",
  "best bakery course in Butwal",
  "bakery training Butwal",
  "baking school Butwal",
  "bartending course Butwal",
  "bartending school Butwal",
  "mixology training Butwal",
  "sushi course Butwal",
  "sushi training Butwal",
  "Japanese cooking course Butwal",
  "hospitality training Butwal",
  "culinary school Butwal",
  "food and beverage training Rupandehi",
  "professional barista program Nepal",
  "latte art course Butwal",
  "espresso training Butwal",
  "café training Nepal",
] as const;

const COURSE_SEO: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    ogTitle: string;
  }
> = {
  barista: {
    title: "Best Barista School in Butwal",
    ogTitle: "Best Barista School in Butwal | Professional Barista Training",
    description:
      "Looking for the best barista school in Butwal? Brew & Bake Academy offers a 4-week professional barista program with hands-on espresso, latte art, milk texturing, and café operations training in Kalikanagar, Rupandehi.",
    keywords: [
      "best barista school in Butwal",
      "barista school Butwal",
      "barista training Butwal",
      "barista course Butwal",
      "coffee school Butwal",
      "coffee training Butwal",
      "espresso training Butwal",
      "latte art course Butwal",
      "professional barista Butwal",
      "barista classes Rupandehi",
      "café training Butwal Nepal",
    ],
  },
  bakery: {
    title: "Best Bakery Course in Butwal",
    ogTitle: "Best Bakery Course in Butwal | Professional Baking Training",
    description:
      "Train at the best bakery course in Butwal. Learn bread, pastry, cake decoration, and professional baking in a fully equipped lab at Brew & Bake Academy, Kalikanagar, Rupandehi.",
    keywords: [
      "best bakery course in Butwal",
      "bakery training Butwal",
      "baking school Butwal",
      "bakery classes Butwal",
      "pastry course Butwal",
      "cake baking course Butwal",
      "bread making course Butwal",
      "professional baking Butwal",
      "baking classes Rupandehi",
      "culinary baking Nepal",
    ],
  },
  bartending: {
    title: "Best Bartending Course in Butwal",
    ogTitle: "Best Bartending Course in Butwal | Mixology & Bar Training",
    description:
      "Join the leading bartending course in Butwal. Master classic cocktails, modern mixology, bar management, and responsible service with hands-on training at Brew & Bake Academy in Rupandehi.",
    keywords: [
      "best bartending course in Butwal",
      "bartending school Butwal",
      "bartending training Butwal",
      "mixology course Butwal",
      "cocktail training Butwal",
      "bar training Butwal",
      "bartender classes Rupandehi",
      "hospitality bar course Nepal",
      "professional bartending Butwal",
    ],
  },
  sushi: {
    title: "Best Sushi Training in Butwal",
    ogTitle: "Sushi Training in Butwal | Japanese Culinary Course",
    description:
      "Learn sushi and Japanese culinary skills in Butwal. Brew & Bake Academy’s sushi program covers rice prep, knife work, nigiri, maki, and omakase-style plating with expert guidance in Rupandehi.",
    keywords: [
      "sushi training Butwal",
      "sushi course Butwal",
      "Japanese cooking course Butwal",
      "sushi classes Rupandehi",
      "Japanese culinary training Nepal",
      "sushi school Butwal",
      "omakase training Butwal",
      "best sushi course in Butwal",
    ],
  },
};

const HOME_TITLE =
  "Best Barista & Bakery School in Butwal | Brew & Bake Academy";

const HOME_DESCRIPTION =
  "Brew & Bake Academy is Butwal’s leading training school for barista, bakery, bartending, and sushi programs. Hands-on classes, expert mentors, and placement support in Kalikanagar, Rupandehi, Nepal.";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export function absoluteUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function getCourseSeo(slug: string) {
  return COURSE_SEO[slug];
}

const defaultOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${siteInfo.company.shortName} — Best barista and bakery school in Butwal`,
} as const;

export const homeMetadata: Metadata = {
  title: {
    default: HOME_TITLE,
    template: `%s | ${siteInfo.company.shortName}`,
  },
  description: HOME_DESCRIPTION,
  keywords: [...SEO_KEYWORDS],
  authors: [{ name: siteInfo.company.name, url: getSiteUrl() }],
  creator: siteInfo.company.name,
  publisher: siteInfo.company.name,
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteInfo.company.shortName,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [defaultOgImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export function createCourseMetadata(course: CourseDetail): Metadata {
  const seo = COURSE_SEO[course.slug];
  const title = seo?.title ?? course.course;
  const description = seo?.description ?? course.shortDescription;
  const path = `/courses/${course.slug}`;
  const pageTitle = `${title} — ${siteInfo.company.shortName}`;
  const courseKeywords = [
    ...(seo?.keywords ?? []),
    course.course,
    course.tagline,
    `${course.course} ${LOCATION.city}`,
    `${course.duration} ${course.difficulty} training`,
    siteInfo.company.shortName,
    ...SEO_KEYWORDS,
  ];

  const ogImage = {
    url: `/courses/${course.slug}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: `${title} at ${siteInfo.company.shortName}, ${LOCATION.label}`,
  };

  return {
    title: pageTitle,
    description,
    keywords: courseKeywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: path,
      siteName: siteInfo.company.shortName,
      title: seo?.ogTitle ?? pageTitle,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.ogTitle ?? pageTitle,
      description,
      images: [ogImage.url],
    },
    robots: homeMetadata.robots,
  };
}

export function createOrganizationJsonLd() {
  const url = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteInfo.company.name,
    alternateName: siteInfo.company.shortName,
    url,
    logo: absoluteUrl(siteInfo.assets.logo),
    description: HOME_DESCRIPTION,
    email: siteInfo.contact.email,
    telephone: siteInfo.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteInfo.contact.address,
      addressLocality: LOCATION.city,
      addressRegion: LOCATION.district,
      addressCountry: "NP",
    },
    areaServed: {
      "@type": "City",
      name: LOCATION.city,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: LOCATION.district,
      },
    },
    knowsAbout: [
      "Barista training",
      "Bakery training",
      "Bartending training",
      "Sushi training",
      "Hospitality education",
    ],
    sameAs: [
      siteInfo.social.instagram,
      siteInfo.social.facebook,
    ].filter((link) => !link.startsWith("#")),
  };
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteInfo.company.shortName,
    url: getSiteUrl(),
    description: HOME_DESCRIPTION,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: siteInfo.company.name,
    },
  };
}

export function createCourseJsonLd(course: CourseDetail) {
  const seo = COURSE_SEO[course.slug];

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: seo?.title ?? course.course,
    description: seo?.description ?? course.shortDescription,
    provider: {
      "@type": "EducationalOrganization",
      name: siteInfo.company.name,
      url: getSiteUrl(),
    },
    url: absoluteUrl(`/courses/${course.slug}`),
    educationalLevel: course.difficulty,
    timeRequired: course.duration,
    teaches: course.outcomes,
    locationCreated: {
      "@type": "Place",
      name: `${siteInfo.company.shortName}, ${LOCATION.label}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteInfo.contact.address,
        addressLocality: LOCATION.city,
        addressRegion: LOCATION.district,
        addressCountry: "NP",
      },
    },
    offers: {
      "@type": "Offer",
      price: course.tuitionNPR,
      priceCurrency: "NPR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/admission"),
    },
    hasCourseInstance: course.startDates.map((startDate) => ({
      "@type": "CourseInstance",
      courseMode: course.format,
      courseWorkload: course.duration,
      startDate,
      maximumAttendeeCapacity: course.seats,
      location: {
        "@type": "Place",
        name: `${siteInfo.company.shortName}, ${LOCATION.label}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: LOCATION.city,
          addressRegion: LOCATION.district,
          addressCountry: "NP",
        },
      },
    })),
  };
}
