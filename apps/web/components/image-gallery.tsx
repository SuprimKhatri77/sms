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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  galleryContainerClass,
  landingEyebrowClass,
  landingSectionBodyClass,
  landingSectionTitleClass,
} from "@/components/landing/landing-styles";
import { LandingSectionPattern } from "@/components/landing/LandingSectionPattern";

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

const categoryTone: Record<string, string> = {
  Barista: "text-(--brand-brown) border-[rgba(194,138,79,0.3)] bg-[rgba(194,138,79,0.08)]",
  Bakery: "text-[#b8956a] border-[rgba(184,149,106,0.3)] bg-[rgba(184,149,106,0.08)]",
  Bartending: "text-(--brand-green) border-[rgba(47,78,64,0.2)] bg-[rgba(47,78,64,0.06)]",
  Training: "text-(--brand-green) border-[rgba(47,78,64,0.2)] bg-[rgba(47,78,64,0.06)]",
};

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -48px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export default function ImageGallery() {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { ref: sectionRef, visible } = useReveal();

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
    thumbRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

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
      ref={sectionRef}
      aria-labelledby="gallery-heading"
      className={cn(
        "gallery-section relative overflow-x-hidden bg-(--brand-cream) py-24",
        visible && "gallery-section--visible",
      )}
    >
      <LandingSectionPattern variant="gallery" />
      <div className={galleryContainerClass}>
        <div className="gallery-reveal mb-12 max-w-2xl">
          <span className={`${landingEyebrowClass} mb-4 inline-block`}>
            Campus & Training
          </span>
          <h2 id="gallery-heading" className={landingSectionTitleClass}>
            Life at
            <br />
            <em
              className="font-medium text-(--brand-brown)"
              style={{ fontStyle: "italic" }}
            >
              Brew & Bake
            </em>
          </h2>
          <p className={`${landingSectionBodyClass} mt-4 max-w-xl`}>
            A glimpse into our labs, workshops, and the hands-on sessions that
            shape confident hospitality professionals.
          </p>
        </div>

        <div className="gallery-reveal gallery-reveal--delay grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_252px]">
          <div className="flex min-w-0 flex-col gap-4">
            <div
              ref={containerRef}
              role="group"
              aria-label="Training photo gallery"
              aria-roledescription="carousel"
              aria-live="polite"
              className="gallery-stage relative mx-auto aspect-[3/2] w-full max-h-[min(52vw,420px)] overflow-hidden border border-[rgba(47,78,64,0.1)] bg-[rgba(47,78,64,0.04)] sm:max-h-[min(48vw,440px)] lg:mx-0 lg:max-h-[460px] lg:aspect-[16/10]"
            >
              <motion.div
                className="flex h-full"
                drag="x"
                dragElastic={0.12}
                dragMomentum={false}
                style={{ x: xSpring }}
                onDragEnd={handleDragEnd}
              >
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="relative h-full min-w-full shrink-0"
                  >
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 900px"
                      className="object-cover select-none"
                      draggable={false}
                      priority={item.id <= 2}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(26,26,26,0.55)] via-transparent to-transparent opacity-80"
                      aria-hidden
                    />
                  </div>
                ))}
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute bottom-0 left-0 right-0 p-5 sm:p-6"
                >
                  <span
                    className={cn(
                      "mb-2 inline-block border px-2.5 py-0.5 font-(family-name:--font-dm-sans) text-[0.65rem] font-semibold uppercase tracking-[0.14em]",
                      categoryTone[active.category],
                    )}
                  >
                    {active.category}
                  </span>
                  <p className="font-[family-name:var(--font-playfair)] text-[1.25rem] font-semibold text-white sm:text-[1.4rem]">
                    {active.title}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="pointer-events-none absolute left-0 right-0 top-0 h-1 bg-[rgba(255,255,255,0.15)]">
                <motion.div
                  className="h-full bg-(--brand-brown)"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              <GalleryNavButton
                direction="prev"
                disabled={index === 0}
                onClick={goPrev}
                className="left-3 sm:left-4"
              />
              <GalleryNavButton
                direction="next"
                disabled={index === items.length - 1}
                onClick={goNext}
                className="right-3 sm:right-4"
              />
            </div>

            <div className="flex items-center justify-between gap-4 px-0.5">
              <p className="sr-only" aria-live="polite">
                Viewing {active.title}: {active.caption}
              </p>
              <p className="font-(family-name:--font-dm-sans) text-[0.8rem] text-[rgba(47,78,64,0.5)]">
                Swipe or use arrow keys to browse
              </p>
              <p className="font-(family-name:--font-dm-sans) text-sm tabular-nums text-(--brand-green)">
                <span className="font-semibold text-(--brand-brown)">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mx-1.5 text-[rgba(47,78,64,0.25)]">/</span>
                {String(items.length).padStart(2, "0")}
              </p>
            </div>

            <div className="gallery-thumbs flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:hidden">
              {items.map((item, i) => (
                <ThumbButton
                  key={item.id}
                  item={item}
                  active={i === index}
                  onClick={() => goTo(i)}
                  ref={(el) => {
                    thumbRefs.current[i] = el;
                  }}
                />
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-5 lg:pt-1">
            <div className="border border-[rgba(47,78,64,0.1)] bg-white p-5">
              <p className="mb-2 font-(family-name:--font-dm-sans) text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-(--brand-brown)">
                Now viewing
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="mb-2 font-[family-name:var(--font-playfair)] text-[1.35rem] font-semibold leading-tight text-(--brand-green)">
                    {active.title}
                  </h3>
                  <p className="font-(family-name:--font-dm-sans) text-[0.88rem] leading-[1.65] text-[rgba(47,78,64,0.62)]">
                    {active.caption}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="hidden flex-col gap-2 lg:flex">
              <p className="font-(family-name:--font-dm-sans) text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[rgba(47,78,64,0.4)]">
                All moments
              </p>
              <div className="gallery-thumbs grid max-h-[360px] grid-cols-2 gap-2 overflow-y-auto pr-1">
                {items.map((item, i) => (
                  <ThumbButton
                    key={item.id}
                    item={item}
                    active={i === index}
                    onClick={() => goTo(i)}
                    variant="grid"
                    ref={(el) => {
                      thumbRefs.current[i] = el;
                    }}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .gallery-reveal {
          opacity: 0;
          transform: translateY(16px);
          transition:
            opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gallery-reveal--delay {
          transition-delay: 90ms;
        }
        .gallery-section--visible .gallery-reveal {
          opacity: 1;
          transform: translateY(0);
        }
        .gallery-stage {
          touch-action: pan-y;
        }
        .gallery-thumbs {
          scrollbar-width: none;
        }
        .gallery-thumbs::-webkit-scrollbar {
          display: none;
        }
        .gallery-thumb {
          transition:
            transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.25s ease,
            opacity 0.25s ease;
        }
        .gallery-thumb:hover {
          transform: translateY(-2px);
        }
        .gallery-thumb--active {
          border-color: var(--brand-brown);
        }
        @media (prefers-reduced-motion: reduce) {
          .gallery-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .gallery-thumb:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}

function GalleryNavButton({
  direction,
  disabled,
  onClick,
  className,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-[rgba(255,255,255,0.35)] bg-[rgba(255,255,255,0.92)] text-(--brand-green) backdrop-blur-sm transition-all duration-200",
        disabled
          ? "cursor-not-allowed opacity-35"
          : "hover:border-(--brand-brown) hover:bg-white hover:text-(--brand-brown) active:scale-95",
        className,
      )}
    >
      <Icon size={18} strokeWidth={2.25} />
    </button>
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
    aria-label={`View photo: ${item.alt}`}
    aria-current={active ? "true" : undefined}
    className={cn(
      "gallery-thumb relative shrink-0 overflow-hidden border-2 border-transparent",
      active && "gallery-thumb--active",
      variant === "strip"
        ? "h-16 w-24 sm:h-[4.5rem] sm:w-28"
        : "aspect-[4/3] w-full",
    )}
  >
    <Image
      src={item.url}
      alt=""
      fill
      sizes={variant === "strip" ? "112px" : "160px"}
      className={cn(
        "object-cover transition-opacity duration-200",
        active ? "opacity-100" : "opacity-70",
      )}
      draggable={false}
    />
    {active ? (
      <span
        className="absolute bottom-0 left-0 h-0.5 w-full bg-(--brand-brown)"
        aria-hidden
      />
    ) : null}
  </button>
);
