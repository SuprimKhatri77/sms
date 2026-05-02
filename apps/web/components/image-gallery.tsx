"use client";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export const items = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1761882835101-02ab45ac0726?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=690",
    title: "MAXX PHAM",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1661980494567-40a5e01b699b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=685",
    title: "BOXIEN BAY",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1761882725885-d3d8bd2032d1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    title: "AUSIZE MAM",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1761775915848-467e41c1c4db?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=689",
    title: "RECLKTIKA",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1761078980679-e89e25fe279b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    title: "SONYPOO",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1760389005000-bf02bf24f463?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1123",
    title: "DONM FLY",
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1761165307495-56bd564d322f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=663",
    title: "Snowy Mountain Highway",
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1756299792672-157811bf1005?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
    title: "FOGGY FOLS",
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1572851899646-a1f69c664e1e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    title: "DIM DARKO",
  },
  {
    id: 10,
    url: "https://images.unsplash.com/photo-1759247178379-0e8eba83a4a6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    title: "BEALIVE",
  },
  {
    id: 11,
    url: "https://images.unsplash.com/photo-1754968230523-052635c98f99?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=736",
    title: "DOMEDOM ROME",
  },
  {
    id: 12,
    url: "https://images.unsplash.com/photo-1643037508102-46fb319979c5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764",
    title: "IKEIMON POVE",
  },
  {
    id: 13,
    url: "https://images.unsplash.com/photo-1555803741-1ac759ac2f53?q=80&w=880&auto=format&fit=crop",
    title: "Wildflower Mountain Meadow",
  },
  {
    id: 14,
    url: "https://images.unsplash.com/photo-1516705486637-7b01bf9b9d13?q=80&w=880&auto=format&fit=crop",
    title: "Mountain Valley Vista",
  },
  {
    id: 15,
    url: "https://images.unsplash.com/photo-1512045519129-eb9ceb788555?q=80&w=880&auto=format&fit=crop",
    title: "Rugged Mountain Terrain",
  },
  {
    id: 16,
    url: "https://images.unsplash.com/photo-1504198266287-1659872e6590?q=80&w=880&auto=format&fit=crop",
    title: "Mountain Wildflower Bloom",
  },
  {
    id: 17,
    url: "https://images.unsplash.com/photo-1611582450053-0f056a82a68e?q=80&w=735&auto=format&fit=crop",
    title: "Mountain River Rapids",
  },
  {
    id: 18,
    url: "https://images.unsplash.com/photo-1590872000386-4348c6393115?q=80&w=688&auto=format&fit=crop",
    title: "Lush Mountain Valley",
  },
];

const FULL_ASPECT_RATIO = 16 / 9;
const COLLAPSED_ASPECT_RATIO = 1 / 3;
const MARGIN = 2;
const GAP = 2;

// Shared spring config used for both carousel and thumbnails
const SPRING = { stiffness: 300, damping: 30, mass: 1 } as const;

function ImageGallery() {
  const [index, setIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * FIX: Drive position with a spring motion value instead of
   * useEffect + animate(). This runs entirely on the compositor
   * thread — no React re-render needed per frame, no lag on mobile.
   *
   * indexMV  → raw target index (set synchronously on tap/swipe end)
   * xPx      → derived pixel offset: index * -containerWidth
   * xSpring  → smoothed version of xPx, fed directly to the DOM
   */
  const indexMV = useMotionValue(0);
  const containerWidth = useMotionValue(1);

  // xPx = indexMV * -containerWidth  (both are motion values → reactive)
  const xPx = useTransform(
    [indexMV, containerWidth] as const,
    ([i, w]: number[]) => i * -w,
  );
  const xSpring = useSpring(xPx, SPRING);

  // Keep containerWidth motion value in sync with actual DOM size
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      containerWidth.set(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerWidth]);

  // Sync indexMV whenever index state changes (arrow buttons, thumbnail clicks)
  useEffect(() => {
    indexMV.set(index);
  }, [index, indexMV]);

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
    } else if (Math.abs(offset) > w * 0.3) {
      next = offset > 0 ? index - 1 : index + 1;
    }

    next = Math.max(0, Math.min(items.length - 1, next));
    setIndex(next); // triggers indexMV sync above
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
      {/* ── LEFT: Text panel ── */}
      <div className="shrink-0 md:w-60 lg:w-72 flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-neutral-400">
          Visual Collection
        </p>

        <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-white">
          Photo Gallery
        </h1>

        <div className="w-10 h-px bg-neutral-300 dark:bg-neutral-600" />

        <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          A curated selection of landscapes, cities, and moments captured from
          around the world.
        </p>

        <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          Swipe or use the arrows to explore each scene.
        </p>

        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-3xl font-bold tabular-nums text-neutral-900 dark:text-white">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-neutral-300 dark:text-neutral-600 text-lg">
            /
          </span>
          <span className="text-sm text-neutral-400 tabular-nums">
            {String(items.length).padStart(2, "0")}
          </span>
        </div>

        <p className="text-xs font-semibold tracking-widest uppercase text-neutral-600 dark:text-neutral-300 truncate">
          {items[index].title}
        </p>
      </div>

      {/* ── RIGHT: Gallery panel ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Carousel */}
        <div className="relative overflow-hidden rounded-xl" ref={containerRef}>
          <motion.div
            className="flex"
            drag="x"
            dragElastic={0.15}
            dragMomentum={false}
            // During drag: xSpring follows the pointer directly (spring is
            // temporarily bypassed by the drag handler). On release, spring
            // snaps to the nearest slide via handleDragEnd → setIndex.
            style={{ x: xSpring }}
            onDragEnd={handleDragEnd}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="shrink-0 w-full h-64 sm:h-72 md:h-80 relative"
                // Prevent the carousel strip from shrinking below one slide
                style={{ minWidth: "100%" }}
              >
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover rounded-xl select-none pointer-events-none"
                  draggable={false}
                  priority={item.id <= 3}
                />
              </div>
            ))}
          </motion.div>

          {/* Prev */}
          <button
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md transition-transform z-10
              ${index === 0 ? "opacity-25 cursor-not-allowed" : "opacity-75 hover:opacity-100 hover:scale-110"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Next */}
          <button
            disabled={index === items.length - 1}
            onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md transition-transform z-10
              ${index === items.length - 1 ? "opacity-25 cursor-not-allowed" : "opacity-75 hover:opacity-100 hover:scale-110"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Thumbnails */}
        <Thumbnails index={index} setIndex={setIndex} />
      </div>
    </div>
  );
}

function Thumbnails({
  index,
  setIndex,
}: {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const x =
    index * 100 * (COLLAPSED_ASPECT_RATIO / FULL_ASPECT_RATIO) +
    MARGIN +
    index * GAP;
  const xSpring = useSpring(x, { bounce: 0 });
  const xPercentage = useMotionTemplate`-${xSpring}%`;

  useEffect(() => {
    xSpring.set(x);
  }, [x, xSpring]);

  return (
    <div className="flex h-14 justify-center overflow-hidden">
      <motion.div
        style={{
          aspectRatio: FULL_ASPECT_RATIO,
          gap: `${GAP}%`,
          x: xPercentage,
        }}
        className="flex min-w-0"
      >
        {items.map((item, i) => (
          <motion.button
            key={item.id}
            onClick={() => setIndex(i)}
            initial={false}
            animate={i === index ? "active" : "inactive"}
            variants={{
              active: {
                aspectRatio: FULL_ASPECT_RATIO,
                marginLeft: `${MARGIN}%`,
                marginRight: `${MARGIN}%`,
              },
              inactive: {
                aspectRatio: COLLAPSED_ASPECT_RATIO,
                marginLeft: 0,
                marginRight: 0,
              },
            }}
            className="h-full shrink-0 relative overflow-hidden rounded-sm"
          >
            <Image
              src={item.url}
              alt={item.title}
              fill
              sizes="80px"
              className="object-cover pointer-events-none select-none"
              draggable={false}
            />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

export default ImageGallery;
