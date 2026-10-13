import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ButtonArrow, siteButton } from "@/components/site/button";
import { ApplyButton } from "./ApplyButton";

export default function ClosingCta({
  secondary = { href: "#programs", label: "Explore courses" },
  applyHref,
}: {
  /** The quiet link beside the Apply button. */
  secondary?: { href: string; label: string };
  /**
   * Make Apply a plain link here instead of the landing page's
   * signed-in-student check (the course pages link straight to it).
   */
  applyHref?: string;
}) {
  return (
    <section
      aria-labelledby="closing-cta-heading"
      className="container-page pb-20 font-site sm:pb-28"
    >
      <Reveal className="relative overflow-hidden bg-pine px-6 py-20 text-center text-paper sm:py-28">
        <p className="eyebrow text-paper/70">Admissions open</p>
        <h2
          id="closing-cta-heading"
          className="display mx-auto mt-5 max-w-3xl text-5xl sm:text-7xl lg:text-8xl"
        >
          Your craft <em>starts here.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[0.9375rem] leading-relaxed text-paper/70">
          Small cohorts, working mentors and commercial equipment from day one.
        </p>
        <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          {applyHref ? (
            <Link
              href={applyHref}
              className={siteButton({ variant: "light", size: "lg" })}
            >
              Apply for admission
              <ButtonArrow />
            </Link>
          ) : (
            <ApplyButton
              className={siteButton({ variant: "light", size: "lg" })}
            >
              Apply for admission
              <ButtonArrow />
            </ApplyButton>
          )}
          <Link
            href={secondary.href}
            className="link-underline text-[0.8125rem] text-paper outline-none"
          >
            {secondary.label}
          </Link>
        </div>

        {/* Slow rotating rings as a quiet ornament. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 size-96 animate-[spin_60s_linear_infinite] rounded-full border border-paper/10 motion-reduce:animate-none"
        >
          <span className="absolute top-1/2 -left-1 size-2 rounded-full bg-clay" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-52 -left-32 size-[28rem] animate-[spin_90s_linear_infinite_reverse] rounded-full border border-paper/10 motion-reduce:animate-none"
        />
      </Reveal>
    </section>
  );
}
