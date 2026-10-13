import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

/**
 * Buttons for the public site. Use the class builder on a <Link>, <a> or
 * <button>; add <ButtonArrow /> as the last child for the primary-CTA nudge.
 */
export const siteButton = cva(
  "group/btn inline-flex shrink-0 items-center justify-center gap-2 font-site font-medium whitespace-nowrap outline-none transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-clay/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        pine: "bg-pine text-paper hover:bg-pine-soft",
        clay: "bg-clay text-ink hover:bg-[#b57d43]",
        outline:
          "border border-hairline bg-paper text-ink hover:border-ink/60",
        ghost: "text-ink hover:bg-surface",
        /* For pine / dark panels. */
        light: "bg-paper text-pine hover:bg-white",
        "outline-light":
          "border border-white/30 text-paper hover:border-white/60 hover:bg-white/5",
      },
      size: {
        sm: "h-9 px-3.5 text-[0.8125rem]",
        md: "h-11 px-5 text-[0.8125rem]",
        lg: "h-12 px-6 text-xs tracking-[0.14em] uppercase",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "pine", size: "md" },
  },
);

export type SiteButtonVariants = VariantProps<typeof siteButton>;

/** Arrow that slides right when its siteButton (or any group/btn) is hovered. */
export function ButtonArrow({ className }: { className?: string }) {
  return (
    <ArrowRightIcon
      aria-hidden
      className={cn(
        "size-3.5 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-1",
        className,
      )}
    />
  );
}
