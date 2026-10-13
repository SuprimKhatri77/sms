import { landingContainerClass } from "@/components/landing/landing-styles";

export const courseContainerClass = landingContainerClass;

export const courseEyebrowClass =
  "font-(family-name:--font-dm-sans) text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-(--brand-brown)";

export const courseTitleClass =
  "font-[family-name:var(--font-playfair)] text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold leading-[1.15] text-(--brand-green)";

export const courseBodyClass =
  "font-(family-name:--font-dm-sans) text-[0.95rem] leading-[1.75] text-[rgba(47,78,64,0.62)]";

/* scroll-mt clears the sticky section nav; html scroll-padding clears the
   site header above it. */
export const courseSectionClass = "scroll-mt-14 px-6 py-20";

export const courseCardClass =
  "border border-[rgba(47,78,64,0.1)] bg-white";

export const coursePrimaryBtnClass =
  "inline-flex items-center justify-center gap-2 border border-(--brand-brown) bg-(--brand-brown) px-6 py-3 font-(family-name:--font-dm-sans) text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5";

export const courseSecondaryBtnClass =
  "inline-flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.06)] px-6 py-3 font-(family-name:--font-dm-sans) text-sm font-semibold text-white transition-colors hover:border-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.1)]";

export const courseMutedSection = "bg-[#f4f1ec]";
export const courseCreamSection = "bg-(--brand-cream)";

/** Shown beneath public course fee displays. */
export const COURSE_PRICE_VAT_NOTE = "This price is inclusive of VAT";

export const coursePriceVatNoteClass =
  "font-(family-name:--font-dm-sans) text-[0.68rem] leading-snug text-[rgba(47,78,64,0.45)]";

/** Builds a translucent color from hex or CSS variable accents. */
export function courseAccentAlpha(color: string, percent: number): string {
  if (color.startsWith("var(")) {
    return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
  }
  if (color.startsWith("#") && color.length === 7) {
    const alpha = Math.round((percent / 100) * 255)
      .toString(16)
      .padStart(2, "0");
    return `${color}${alpha}`;
  }
  return color;
}

export type CourseToneKey = "coffee" | "bakery" | "bartending" | "sushi";

export const courseTones: Record<
  CourseToneKey,
  { accent: string; soft: string; border: string }
> = {
  coffee: {
    accent: "var(--brand-brown)",
    soft: "rgba(194,138,79,0.1)",
    border: "rgba(194,138,79,0.28)",
  },
  bakery: {
    accent: "#b8956a",
    soft: "rgba(184,149,106,0.1)",
    border: "rgba(184,149,106,0.28)",
  },
  bartending: {
    accent: "var(--brand-green)",
    soft: "rgba(47,78,64,0.08)",
    border: "rgba(47,78,64,0.2)",
  },
  sushi: {
    accent: "var(--brand-green)",
    soft: "rgba(47,78,64,0.08)",
    border: "rgba(47,78,64,0.2)",
  },
};
