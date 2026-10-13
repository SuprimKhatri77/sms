"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ButtonArrow, siteButton } from "@/components/site/button";
import { cn } from "@/lib/utils";

/**
 * A bar pinned to the bottom of small screens once the hero's Apply button
 * has scrolled away, hidden again while the enrol card itself is on screen.
 * It publishes its height as --enrol-bar-h so the WhatsApp button can sit
 * above it.
 */
export function MobileEnrolBar({
  name,
  feeLabel,
  heroCtaId,
  enrolCardId,
}: {
  name: string;
  feeLabel: string;
  heroCtaId: string;
  enrolCardId: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [pastHero, setPastHero] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const visible = pastHero && !cardVisible;

  useEffect(() => {
    const hero = document.getElementById(heroCtaId);
    const card = document.getElementById(enrolCardId);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) {
          // Only "past" once it has left through the top of the viewport.
          setPastHero(
            !entry.isIntersecting && entry.boundingClientRect.top < 0,
          );
        } else if (entry.target === card) {
          setCardVisible(entry.isIntersecting);
        }
      }
    });
    if (hero) observer.observe(hero);
    if (card) observer.observe(card);
    return () => observer.disconnect();
  }, [heroCtaId, enrolCardId]);

  useEffect(() => {
    const root = document.documentElement;
    const height = visible ? (barRef.current?.offsetHeight ?? 0) : 0;
    root.style.setProperty("--enrol-bar-h", `${height}px`);
    return () => {
      root.style.removeProperty("--enrol-bar-h");
    };
  }, [visible]);

  return (
    <div
      ref={barRef}
      inert={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-paper/95 font-site backdrop-blur-xl transition-transform duration-500 ease-out-expo lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="container-page flex items-center justify-between gap-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <p className="truncate font-display text-xl leading-tight text-ink">
            {name}
          </p>
          <p className="font-label text-[0.6875rem] tracking-[0.06em] text-ink-muted tabular-nums">
            {feeLabel}
          </p>
        </div>
        <Link
          href="/admission"
          className={siteButton({ variant: "pine", size: "md" })}
        >
          Apply now
          <ButtonArrow />
        </Link>
      </div>
    </div>
  );
}
