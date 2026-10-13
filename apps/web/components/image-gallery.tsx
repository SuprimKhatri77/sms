"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { Reveal } from "@/components/motion/reveal";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { siteButton } from "@/components/site/button";
import { SectionHeading } from "@/components/site/section-heading";

export const items = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
    title: "Espresso & Extraction",
    category: "Barista",
    caption: "Dialing in grind, dose, and yield on commercial machines.",
    alt: "Espresso and extraction training at Brew & Bake Academy Butwal",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1200&auto=format&fit=crop",
    title: "Latte Art Practice",
    category: "Barista",
    caption: "Milk texturing and free-pour techniques in the training lab.",
    alt: "Barista latte art training at Brew & Bake Academy Butwal",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200&auto=format&fit=crop",
    title: "Artisan Bread Making",
    category: "Bakery",
    caption: "From mixing and fermentation to shaping and bake-off.",
    alt: "Bakery class students learning bread making in Rupandehi",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop",
    title: "Pastry & Viennoiserie",
    category: "Bakery",
    caption: "Laminating, piping, and finishing in the pastry kitchen.",
    alt: "Pastry and viennoiserie training at Brew & Bake Academy Butwal",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1200&auto=format&fit=crop",
    title: "Classic Cocktails",
    category: "Bartending",
    caption: "Build, stir, shake — fundamentals behind every great drink.",
    alt: "Bartending and cocktail training at Brew & Bake Academy Butwal",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1200&auto=format&fit=crop",
    title: "Hands-On Kitchen Labs",
    category: "Training",
    caption: "Small cohorts mean more practice time and direct feedback.",
    alt: "Hands-on hospitality training lab at Brew & Bake Academy, Rupandehi",
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop",
    title: "Café Workflow",
    category: "Barista",
    caption: "Service flow, hygiene, and speed behind a busy bar.",
    alt: "Café workflow and barista service training in Butwal",
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=1200&auto=format&fit=crop",
    title: "Plating & Presentation",
    category: "Bakery",
    caption: "Finishing skills that translate straight to the shop floor.",
    alt: "Bakery plating and presentation class at Brew & Bake Academy Butwal",
  },
] as const;

const SPRING = { stiffness: 320, damping: 32, mass: 0.9 } as const;

const pad = (n: number) => String(n).padStart(2, "0");

/** Scrolls a thumbnail to the middle of its own strip, never the page. */
function centerInStrip(thumb: HTMLElement | null | undefined) {
  const strip = thumb?.parentElement;
  if (!thumb || !strip || strip.offsetParent === null) return;
  strip.scrollTo({
    left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2,
    top: thumb.offsetTop - (strip.clientHeight - thumb.clientHeight) / 2,
    behavior: "smooth",
  });
}

export default function ImageGallery() {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const gridRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = usePrefersReducedMotion(false);

  const indexMV = useMotionValue(0);
  const containerWidth = useMotionValue(1);
  const xPx = useTransform(
    [indexMV, containerWidth] as const,
    ([i, w]: number[]) => i * -w,
  );
  const xSpring = useSpring(xPx, SPRING);

  const active = items[index];
  const progress = ((index + 1) / items.length) * 100;

  const goTo = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(items.length - 1, next)));
  }, []);

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      containerWidth.set(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerWidth]);

  useEffect(() => {
    indexMV.set(index);
  }, [index, indexMV]);

  useEffect(() => {
    centerInStrip(stripRefs.current[index]);
    centerInStrip(gridRefs.current[index]);
  }, [index]);

  // Arrow keys work while focus is inside the gallery, not page-wide.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };

  const handleDragEnd = (
    _: never,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    const w = containerWidth.get();
    const { x: offset } = info.offset;
    const { x: velocity } = info.velocity;

    let next = index;
    if (Math.abs(velocity) > 500) {
      next = velocity > 0 ? index - 1 : index + 1;
    } else if (Math.abs(offset) > w * 0.22) {
      next = offset > 0 ? index - 1 : index + 1;
    }

    goTo(next);
  };

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="overflow-x-hidden border-t border-hairline bg-surface py-20 font-site sm:py-28"
    >
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="gallery-heading"
            eyebrow="Campus & training"
            title={
              <>
                Life at <em>Brew &amp; Bake.</em>
              </>
            }
            description="A glimpse into our labs, workshops, and the hands-on sessions that shape confident hospitality professionals."
          />
        </Reveal>

        <Reveal
          delay={0.1}
          onKeyDown={handleKeyDown}
          className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-10"
        >
          <div className="flex min-w-0 flex-col gap-5">
            <div
              ref={containerRef}
              role="group"
              aria-label="Training photo gallery. Use the arrow keys to browse."
              aria-roledescription="carousel"
              tabIndex={0}
              className="relative aspect-[3/2] w-full touch-pan-y overflow-hidden bg-hairline outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 focus-visible:ring-offset-surface lg:aspect-[16/10]"
            >
              <motion.div
                className="flex h-full"
                drag="x"
                dragElastic={0.12}
                dragMomentum={false}
                style={{ x: reduceMotion ? xPx : xSpring }}
                onDragEnd={handleDragEnd}
              >
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className="relative h-full min-w-full shrink-0"
                    aria-hidden={i !== index}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1024px) 70vw, 100vw"
                      className="object-cover select-none"
                      draggable={false}
                    />
                  </div>
                ))}
              </motion.div>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"
              />

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-paper sm:p-7"
                >
                  <p className="font-label text-[0.6875rem] tracking-[0.16em] text-paper/80 uppercase">
                    {active.category}
                  </p>
                  <p className="mt-2 font-display text-3xl leading-none sm:text-4xl">
                    {active.title}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-5">
              <p className="font-label text-[0.75rem] tracking-[0.08em] text-ink tabular-nums">
                {pad(index + 1)}
                <span className="mx-1.5 text-ink-muted">/</span>
                <span className="text-ink-muted">{pad(items.length)}</span>
              </p>
              <div aria-hidden className="relative h-px flex-1 bg-hairline">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-ink"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                />
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={index === 0}
                  aria-label="Previous photo"
                  className={siteButton({ variant: "outline", size: "icon" })}
                >
                  <ArrowLeftIcon weight="light" className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={index === items.length - 1}
                  aria-label="Next photo"
                  className={siteButton({ variant: "outline", size: "icon" })}
                >
                  <ArrowRightIcon weight="light" className="size-4" />
                </button>
              </div>
            </div>

            <p className="sr-only" aria-live="polite">
              Photo {index + 1} of {items.length}: {active.title}.{" "}
              {active.caption}
            </p>

            <div className="scrollbar-hidden relative flex gap-2 overflow-x-auto lg:hidden">
              {items.map((item, i) => (
                <ThumbButton
                  key={item.id}
                  item={item}
                  active={i === index}
                  onClick={() => goTo(i)}
                  ref={(el) => {
                    stripRefs.current[i] = el;
                  }}
                />
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-8">
            <div className="border-t border-ink pt-5">
              <p className="eyebrow">Now viewing</p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                >
                  <h3 className="mt-3 font-display text-3xl leading-tight text-ink">
                    {active.title}
                  </h3>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-muted">
                    {active.caption}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="hidden flex-col gap-3 lg:flex">
              <p className="eyebrow">All moments</p>
              <div className="scrollbar-hidden relative grid max-h-[22rem] grid-cols-2 gap-2 overflow-y-auto">
                {items.map((item, i) => (
                  <ThumbButton
                    key={item.id}
                    item={item}
                    active={i === index}
                    onClick={() => goTo(i)}
                    variant="grid"
                    ref={(el) => {
                      gridRefs.current[i] = el;
                    }}
                  />
                ))}
              </div>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}

const ThumbButton = ({
  item,
  active,
  onClick,
  variant = "strip",
  ref,
}: {
  item: (typeof items)[number];
  active: boolean;
  onClick: () => void;
  variant?: "strip" | "grid";
  ref?: (el: HTMLButtonElement | null) => void;
}) => (
  <button
    type="button"
    ref={ref}
    onClick={onClick}
    aria-label={`View photo: ${item.title}`}
    aria-current={active ? "true" : undefined}
    className={cn(
      "group relative shrink-0 overflow-hidden bg-hairline outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-inset",
      variant === "strip" ? "h-16 w-24 sm:h-[4.5rem] sm:w-28" : "aspect-[4/3] w-full",
    )}
  >
    <Image
      src={item.url}
      alt=""
      fill
      sizes={variant === "strip" ? "112px" : "136px"}
      className={cn(
        "object-cover transition-[opacity,transform] duration-500 ease-out-expo group-hover:scale-105",
        active ? "opacity-100" : "opacity-55 group-hover:opacity-90",
      )}
      draggable={false}
    />
    <span
      aria-hidden
      className={cn(
        "absolute inset-x-0 bottom-0 h-0.5 origin-left bg-clay transition-transform duration-500 ease-out-expo",
        active ? "scale-x-100" : "scale-x-0",
      )}
    />
  </button>
);
