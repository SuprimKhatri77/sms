"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

const HERO_VIDEO = "https://www.pexels.com/download/video/8935791/";
const HERO_POSTER =
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1600&auto=format&fit=crop";
const HERO_INSET =
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop";

/**
 * The hero's photo panel. A still photo always renders (and is the LCP
 * image); the training video loads on top of it in the browser and fades in
 * once it plays, so a slow or failed video never leaves an empty frame.
 * Reduced-motion users keep the still.
 */
export function HeroMedia({ className }: { className?: string }) {
  // No video in the server render; it is decided in the browser.
  const reduceMotion = usePrefersReducedMotion(true);
  const [playing, setPlaying] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-[5/4] lg:aspect-auto lg:h-[calc(100svh-var(--header-h)-8rem)] lg:min-h-[32rem] lg:max-h-[56rem]">
        <Image
          src={HERO_POSTER}
          alt="Lattes with poured latte art on a café table"
          fill
          preload
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="animate-hero-settle object-cover"
        />
        {!reduceMotion ? (
          <video
            src={HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            aria-label="Live barista and hospitality training sessions at Brew and Bake Academy Butwal"
            onPlaying={() => setPlaying(true)}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-out-expo",
              playing ? "opacity-100" : "opacity-0",
            )}
          />
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent"
        />
        <p className="absolute right-4 bottom-4 flex items-center gap-2 bg-paper/90 px-3 py-1.5 font-label text-[0.625rem] tracking-[0.14em] text-ink uppercase backdrop-blur-sm sm:right-5 sm:bottom-5">
          <span aria-hidden className="size-1.5 rounded-full bg-clay" />
          Live training sessions
        </p>
      </div>

      <div
        className="animate-rise absolute -bottom-8 left-0 hidden w-[34%] max-w-64 border-[6px] border-paper bg-surface md:block lg:-left-2"
        style={{ "--i": 7 } as React.CSSProperties}
      >
        <div className="relative aspect-square">
          <Image
            src={HERO_INSET}
            alt="A chocolate layer cake finished with piped rosettes"
            fill
            sizes="(min-width: 1024px) 16rem, 34vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
