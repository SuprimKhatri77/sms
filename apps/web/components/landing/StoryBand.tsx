"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, useScroll, useTransform } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { siteInfo } from "@/utils/site-info";
import { Reveal } from "@/components/motion/reveal";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

const STORY_IMAGE =
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1600&auto=format&fit=crop";

/** An editorial split about the academy; the photo drifts against the scroll. */
export default function StoryBand() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  // MotionConfig's reducedMotion only covers animations, not scroll-linked
  // styles, so hold the photo still here explicitly.
  const reduceMotion = usePrefersReducedMotion(false);

  return (
    <section
      aria-labelledby="story-heading"
      className="container-page grid items-center gap-10 py-20 font-site sm:py-28 lg:grid-cols-12 lg:gap-16"
    >
      <div
        ref={ref}
        className="relative aspect-[3/2] overflow-hidden bg-surface lg:col-span-7"
      >
        <m.div
          className="absolute inset-x-0 -inset-y-[10%]"
          style={{ y: reduceMotion ? 0 : y }}
        >
          <Image
            src={STORY_IMAGE}
            alt="A trainee chopping vegetables during a hands-on kitchen class"
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
        </m.div>
      </div>

      <Reveal className="space-y-6 lg:col-span-5">
        <p className="eyebrow">The academy</p>
        <h2 id="story-heading" className="display text-5xl text-ink sm:text-6xl">
          Learn it by <em>doing it.</em>
        </h2>
        <p className="max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
          {`${siteInfo.company.tagline} Every session at ${siteInfo.company.shortName} happens on the same commercial machines, ovens and bar stations you'll use at work, with a mentor beside you correcting technique as you go.`}
        </p>
        <p className="max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
          Find us in {siteInfo.contact.address}.
        </p>
        <Link
          href="#gallery"
          className="group inline-flex items-center gap-2 text-[0.8125rem] text-ink outline-none"
        >
          <span className="link-underline">Look inside the labs</span>
          <ArrowRightIcon
            aria-hidden
            className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
          />
        </Link>
      </Reveal>
    </section>
  );
}
