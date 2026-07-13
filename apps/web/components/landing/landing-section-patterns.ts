import type { CSSProperties } from "react";

/**
 * Section background patterns adapted from Pattern Craft (patterncraft.store)
 * and tinted for the Brew & Bake brand palette.
 *
 * Card-heavy sections (why-us, how-it-works, testimonials) intentionally use
 * plain section backgrounds so card patterns do not feel repetitive.
 */
export type LandingSectionPatternVariant =
  | "programs"
  | "gallery"
  | "partners"
  | "inquiry"
  | "footer";

const grid = "rgba(47,78,64,0.04)";
const gridSoft = "rgba(47,78,64,0.03)";
const gridDark = "rgba(255,255,255,0.045)";
const brownGlow = "rgba(194,138,79,0.12)";
const brownGlowSoft = "rgba(194,138,79,0.08)";
const greenGlow = "rgba(47,78,64,0.08)";

/** Top fade grid with warm corner glow */
function programsPattern(): CSSProperties {
  return {
    backgroundImage: `
      radial-gradient(ellipse 72% 52% at 100% 0%, ${brownGlow}, transparent 58%),
      radial-gradient(ellipse 48% 40% at 0% 100%, ${greenGlow}, transparent 52%),
      linear-gradient(to bottom, rgba(251,250,247,0.94) 0%, transparent 42%),
      linear-gradient(${grid} 1px, transparent 1px),
      linear-gradient(90deg, ${grid} 1px, transparent 1px)
    `,
    backgroundSize: "100% 100%, 100% 100%, 100% 100%, 44px 44px, 44px 44px",
  };
}

/** Left-masked fade grid with amber glow */
function galleryPattern(): CSSProperties {
  return {
    backgroundImage: `
      radial-gradient(ellipse 54% 62% at 100% 18%, ${brownGlow}, transparent 58%),
      linear-gradient(to right, rgba(251,250,247,0.95) 0%, transparent 58%),
      linear-gradient(${gridSoft} 1px, transparent 1px),
      linear-gradient(90deg, ${gridSoft} 1px, transparent 1px)
    `,
    backgroundSize: "100% 100%, 100% 100%, 34px 34px, 34px 34px",
  };
}

/** Warm dual-corner glow with paper grain */
function partnersPattern(): CSSProperties {
  return {
    backgroundImage: `
      url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"),
      radial-gradient(ellipse 64% 50% at 0% 0%, ${brownGlowSoft}, transparent 54%),
      radial-gradient(ellipse 52% 42% at 100% 100%, ${greenGlow}, transparent 50%),
      linear-gradient(135deg, rgba(251,250,247,0.98) 0%, rgba(244,241,236,0.72) 100%)
    `,
    backgroundSize: "256px 256px, 100% 100%, 100% 100%, 100% 100%",
  };
}

/** Diagonal lines with inquiry glow */
function inquiryPattern(): CSSProperties {
  return {
    backgroundImage: `
      radial-gradient(ellipse 68% 54% at 0% 52%, ${brownGlowSoft}, transparent 52%),
      radial-gradient(ellipse 46% 40% at 100% 82%, ${greenGlow}, transparent 48%),
      repeating-linear-gradient(
        45deg,
        rgba(194,138,79,0.04) 0,
        rgba(194,138,79,0.04) 1px,
        transparent 1px,
        transparent 17px
      ),
      repeating-linear-gradient(
        -45deg,
        rgba(47,78,64,0.035) 0,
        rgba(47,78,64,0.035) 1px,
        transparent 1px,
        transparent 17px
      )
    `,
    backgroundSize: "100% 100%, 100% 100%, auto, auto",
  };
}

/** Dark basic grid with warm spotlight */
function footerPattern(): CSSProperties {
  return {
    backgroundImage: `
      radial-gradient(ellipse 58% 48% at 100% 0%, rgba(194,138,79,0.16), transparent 56%),
      linear-gradient(${gridDark} 1px, transparent 1px),
      linear-gradient(90deg, ${gridDark} 1px, transparent 1px)
    `,
    backgroundSize: "100% 100%, 38px 38px, 38px 38px",
  };
}

export function getLandingSectionPattern(
  variant: LandingSectionPatternVariant,
): CSSProperties {
  switch (variant) {
    case "programs":
      return programsPattern();
    case "gallery":
      return galleryPattern();
    case "partners":
      return partnersPattern();
    case "inquiry":
      return inquiryPattern();
    case "footer":
      return footerPattern();
  }
}
