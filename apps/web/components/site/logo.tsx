import Image from "next/image";
import Link from "next/link";
import { siteInfo } from "@/utils/site-info";
import { cn } from "@/lib/utils";

/** Shield emblem + serif wordmark. `tone="light"` for pine backgrounds. */
export function SiteLogo({
  tone = "dark",
  className,
  onClick,
}: {
  tone?: "dark" | "light";
  className?: string;
  onClick?: () => void;
}) {
  const light = tone === "light";
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${siteInfo.company.shortName} home`}
      className={cn(
        "flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-clay/60",
        className,
      )}
    >
      <Image
        src={siteInfo.assets.watermarkNoBG}
        alt=""
        width={38}
        height={36}
        priority
        // On pine, a solid white silhouette of the shield reads cleanly.
        className={cn("h-9 w-auto shrink-0", light && "brightness-0 invert")}
      />
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-[1.55rem] tracking-[-0.02em]",
            light ? "text-paper" : "text-pine",
          )}
        >
          Brew &amp; Bake
        </span>
        <span
          className={cn(
            "mt-1 block font-label text-[0.55rem] tracking-[0.34em] uppercase",
            light ? "text-paper/60" : "text-clay-deep",
          )}
        >
          Academy
        </span>
      </span>
    </Link>
  );
}
