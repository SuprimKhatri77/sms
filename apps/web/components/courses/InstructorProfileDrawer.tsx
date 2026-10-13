"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { XIcon } from "@phosphor-icons/react/ssr";
import { siteButton } from "@/components/site/button";
import { courseAccentAlpha } from "./course-styles";
import { cn } from "@/lib/utils";

export interface InstructorExperience {
  role: string;
  place: string;
  period?: string;
}

export interface InstructorProfile {
  headline: string;
  experience: InstructorExperience[];
  expertise: string[];
}

export interface Instructor {
  name: string;
  title: string;
  bio: string;
  yearsExp: number;
  imagePlaceholder: string;
  image?: string;
  hasProfileCard?: boolean;
  profile?: InstructorProfile;
}

/** Side sheet with a mentor's bio, experience timeline and expertise. */
export function InstructorProfileDrawer({
  instructor,
  accent = "var(--brand-brown)",
  onClose,
}: {
  instructor: Instructor;
  accent?: string;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleClose = useCallback(() => {
    setVisible(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Focus the sheet on open; hand focus back to whatever opened it on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const timer = closeTimer;
    return () => {
      clearTimeout(timer.current);
      opener?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const { profile } = instructor;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${instructor.name} profile`}
      className={cn(
        "fixed inset-0 z-100 bg-ink/40 font-site backdrop-blur-xs transition-opacity duration-500 ease-out-expo",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0 flex h-dvh w-full max-w-lg flex-col overflow-hidden border-l border-hairline bg-paper transition-transform duration-500 ease-out-expo",
          visible ? "translate-x-0" : "translate-x-full",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-(--header-h) shrink-0 items-center justify-between border-b border-hairline px-5 sm:px-8">
          <p className="eyebrow">Mentor profile</p>
          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            className={cn(siteButton({ variant: "ghost", size: "icon" }), "-mr-2")}
            aria-label="Close profile"
          >
            <XIcon weight="light" className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-[7rem_1fr] items-end gap-5 px-5 pt-8 pb-6 sm:grid-cols-[8.5rem_1fr] sm:px-8">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface">
              {instructor.image ? (
                <Image
                  src={instructor.image}
                  alt={`Portrait of ${instructor.name}`}
                  fill
                  className="object-cover object-top"
                  sizes="136px"
                  preload
                />
              ) : (
                <div
                  className="size-full opacity-50"
                  style={{ backgroundColor: instructor.imagePlaceholder }}
                  aria-hidden
                />
              )}
            </div>

            <div className="min-w-0 space-y-2 pb-1">
              {profile?.headline ? (
                <p className="font-label text-[0.625rem] leading-snug tracking-[0.14em] text-ink-muted uppercase">
                  {profile.headline}
                </p>
              ) : null}
              <h2 className="font-display text-3xl leading-[1.05] text-ink sm:text-4xl">
                {instructor.name}
              </h2>
              <p className="text-[0.8125rem] text-ink-muted">
                {instructor.title}
              </p>
              <p className="font-label text-[0.6875rem] tracking-[0.14em] text-ink uppercase">
                {instructor.yearsExp} yrs experience
              </p>
            </div>
          </div>

          <div className="border-t border-hairline px-5 py-8 sm:px-8">
            <p className="max-w-prose text-[0.9375rem] leading-relaxed text-ink-muted">
              {instructor.bio}
            </p>
          </div>

          {profile?.experience && profile.experience.length > 0 ? (
            <section className="border-t border-hairline px-5 py-8 sm:px-8">
              <h3 className="eyebrow mb-6">Experience</h3>
              <ol className="relative space-y-6 pl-6">
                <span
                  aria-hidden
                  className="absolute top-2 bottom-2 left-[3px] w-px"
                  style={{ backgroundColor: courseAccentAlpha(accent, 35) }}
                />
                {profile.experience.map((exp, index) => (
                  <li key={index} className="relative">
                    <span
                      aria-hidden
                      className="absolute top-[0.45rem] -left-6 size-[7px]"
                      style={{ backgroundColor: accent }}
                    />
                    <p className="text-[0.9375rem] font-medium text-ink">
                      {exp.role}
                    </p>
                    <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.8125rem] text-ink-muted">
                      <span>{exp.place}</span>
                      {exp.period ? (
                        <span className="font-label text-[0.6875rem] tracking-[0.08em] uppercase">
                          {exp.period}
                        </span>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {profile?.expertise && profile.expertise.length > 0 ? (
            <section className="border-t border-hairline px-5 py-8 sm:px-8">
              <h3 className="eyebrow mb-5">Core expertise</h3>
              <ul className="flex flex-wrap gap-2">
                {profile.expertise.map((skill) => (
                  <li
                    key={skill}
                    className="border border-hairline bg-surface px-3 py-1.5 text-[0.8125rem] text-ink"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
