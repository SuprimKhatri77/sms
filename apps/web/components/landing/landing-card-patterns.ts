import type { CSSProperties } from "react";

/**
 * Card background patterns adapted for the brand palette.
 * Inspired by grid/glow snippets from Pattern Craft (patterncraft.store).
 */
export type LandingCardPatternTone = "brown" | "green";

const gridLineBrown = "rgba(194,138,79,0.07)";
const gridLineGreen = "rgba(47,78,64,0.06)";
const glowBrown = "rgba(194,138,79,0.1)";
const glowGreen = "rgba(47,78,64,0.08)";

/** Top fade grid + warm corner glow */
function topFadeGridBrown(): CSSProperties {
  return {
    backgroundImage: `
      radial-gradient(ellipse 80% 55% at 100% 0%, ${glowBrown}, transparent 58%),
      linear-gradient(to bottom, rgba(251,250,247,0.92) 0%, transparent 48%),
      linear-gradient(${gridLineBrown} 1px, transparent 1px),
      linear-gradient(90deg, ${gridLineBrown} 1px, transparent 1px)
    `,
    backgroundSize: "100% 100%, 100% 100%, 26px 26px, 26px 26px",
  };
}

/** Dashed grid with top fade — lighter geometric texture */
function dashedFadeGridBrown(): CSSProperties {
  return {
    backgroundImage: `
      linear-gradient(to bottom, rgba(251,250,247,0.88) 0%, transparent 55%),
      repeating-linear-gradient(
        0deg,
        ${gridLineBrown} 0,
        ${gridLineBrown} 1px,
        transparent 1px,
        transparent 10px
      ),
      repeating-linear-gradient(
        90deg,
        ${gridLineBrown} 0,
        ${gridLineBrown} 1px,
        transparent 1px,
        transparent 10px
      )
    `,
    backgroundSize: "100% 100%, 20px 20px, 20px 20px",
  };
}

/** Top fade grid + soft green glow bottom-left */
function topFadeGridGreen(): CSSProperties {
  return {
    backgroundImage: `
      radial-gradient(ellipse 75% 50% at 0% 100%, ${glowGreen}, transparent 52%),
      linear-gradient(to bottom, rgba(244,241,236,0.9) 0%, transparent 50%),
      linear-gradient(${gridLineGreen} 1px, transparent 1px),
      linear-gradient(90deg, ${gridLineGreen} 1px, transparent 1px)
    `,
    backgroundSize: "100% 100%, 100% 100%, 28px 28px, 28px 28px",
  };
}

/** Diagonal cross hatch — subtle decorative lines */
function diagonalCrossGreen(): CSSProperties {
  return {
    backgroundImage: `
      linear-gradient(to bottom, rgba(244,241,236,0.85) 0%, transparent 45%),
      repeating-linear-gradient(
        45deg,
        ${gridLineGreen} 0,
        ${gridLineGreen} 1px,
        transparent 1px,
        transparent 14px
      ),
      repeating-linear-gradient(
        -45deg,
        ${gridLineGreen} 0,
        ${gridLineGreen} 1px,
        transparent 1px,
        transparent 14px
      )
    `,
    backgroundSize: "100% 100%, auto, auto",
  };
}

export function getLandingCardPattern(
  tone: LandingCardPatternTone,
  index = 0,
): CSSProperties {
  const alt = index % 2 === 1;

  if (tone === "brown") {
    return alt ? dashedFadeGridBrown() : topFadeGridBrown();
  }

  return alt ? diagonalCrossGreen() : topFadeGridGreen();
}
