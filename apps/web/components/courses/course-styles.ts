/** Shown beneath public course fee displays. */
export const COURSE_PRICE_VAT_NOTE = "This price is inclusive of VAT";

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

/** Each course's accent: the dot in its eyebrow, nav underline and markers. */
export const courseTones: Record<CourseToneKey, { accent: string }> = {
  coffee: { accent: "var(--brand-brown)" },
  bakery: { accent: "#b8956a" },
  bartending: { accent: "var(--brand-green)" },
  sushi: { accent: "var(--brand-green)" },
};
