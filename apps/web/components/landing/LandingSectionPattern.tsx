import { cn } from "@/lib/utils";
import {
  getLandingSectionPattern,
  type LandingSectionPatternVariant,
} from "./landing-section-patterns";

type LandingSectionPatternProps = {
  variant: LandingSectionPatternVariant;
  className?: string;
  opacityClassName?: string;
};

export function LandingSectionPattern({
  variant,
  className,
  opacityClassName = "opacity-100",
}: LandingSectionPatternProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        opacityClassName,
        className,
      )}
      style={getLandingSectionPattern(variant)}
    />
  );
}
