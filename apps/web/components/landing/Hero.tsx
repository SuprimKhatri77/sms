import Link from "next/link";
import { siteInfo } from "@/utils/site-info";
import { ButtonArrow, siteButton } from "@/components/site/button";
import { ApplyButton } from "./ApplyButton";
import { HeroMedia } from "./HeroMedia";

const titleLines = ["Brew.", "Bake.", "Build a career."];

/**
 * The landing hero: an off-centre split with the serif headline rising in
 * line by line and the training footage settling from a slight zoom. The
 * copy animates with CSS so it plays on first paint, before hydration.
 */
export default function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="home-heading"
      className="container-page grid items-center gap-12 pt-10 pb-20 font-site sm:pb-24 lg:min-h-[calc(100svh-var(--header-h)-2.25rem)] lg:grid-cols-12 lg:gap-8 lg:py-12"
    >
      <div className="space-y-8 lg:col-span-5 lg:pr-4">
        <p className="eyebrow animate-rise">
          Butwal · Barista &amp; Bakery Academy
        </p>

        <h1
          id="home-heading"
          className="display text-[clamp(3.5rem,6vw,6.25rem)] text-ink"
        >
          {titleLines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.08em]">
              <span
                className="animate-rise block"
                style={{ "--i": i + 1 } as React.CSSProperties}
              >
                {i === titleLines.length - 1 ? <em>{line}</em> : line}
              </span>
            </span>
          ))}
        </h1>

        <p
          className="animate-rise max-w-md text-base leading-relaxed text-ink-muted"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          Practical training from working baristas and bakers.{" "}
          <span className="text-ink">
            Graduate job-ready, not just certified.
          </span>
        </p>

        <div
          className="animate-rise flex flex-wrap items-center gap-x-7 gap-y-4"
          style={{ "--i": 5 } as React.CSSProperties}
        >
          <ApplyButton className={siteButton({ variant: "pine", size: "lg" })}>
            Apply for admission
            <ButtonArrow />
          </ApplyButton>
          <Link
            href="#programs"
            className="link-underline text-[0.8125rem] text-ink outline-none"
          >
            Explore courses
          </Link>
        </div>

        <dl
          className="animate-rise grid grid-cols-2 gap-x-6 gap-y-5 border-t border-hairline pt-6 sm:grid-cols-4"
          style={{ "--i": 6 } as React.CSSProperties}
        >
          {siteInfo.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1.5">
              <dt className="font-label text-[0.625rem] leading-snug tracking-[0.12em] text-ink-muted uppercase">
                {stat.label}
              </dt>
              <dd className="order-first font-display text-3xl leading-none text-ink">
                {stat.number}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <HeroMedia className="lg:col-span-7 lg:pl-8" />
    </section>
  );
}
