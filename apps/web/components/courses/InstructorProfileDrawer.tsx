"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Briefcase, Sparkles } from "lucide-react";
import {
  courseBodyClass,
  courseEyebrowClass,
  courseAccentAlpha,
} from "./course-styles";
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

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
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
        "fixed inset-0 z-100 bg-[rgba(47,78,64,0.5)] backdrop-blur-[2px] transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "absolute right-0 top-0 flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-[rgba(47,78,64,0.12)] bg-(--brand-cream) shadow-[-12px_0_48px_rgba(47,78,64,0.14)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          visible ? "translate-x-0" : "translate-x-full",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden bg-(--brand-green)">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
            }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 h-40 w-40 opacity-20 blur-3xl"
            style={{ background: "rgba(194,138,79,0.35)" }}
            aria-hidden
          />

          <div className="relative flex items-end gap-4 px-5 pb-5 pt-6 sm:px-6">
            <div className="relative h-[7.5rem] w-[5.5rem] shrink-0 overflow-hidden border border-[rgba(255,255,255,0.15)]">
              {instructor.image ? (
                <Image
                  src={instructor.image}
                  alt={`Portrait of ${instructor.name}`}
                  fill
                  className="object-cover object-top"
                  sizes="88px"
                  priority
                />
              ) : (
                <div
                  className="h-full w-full opacity-50"
                  style={{ backgroundColor: instructor.imagePlaceholder }}
                  aria-hidden
                />
              )}
            </div>

            <div className="min-w-0 flex-1 pb-1">
              {profile?.headline ? (
                <p className="mb-1 truncate font-[family-name:var(--font-dm-sans)] text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                  {profile.headline}
                </p>
              ) : null}
              <h2 className="font-[family-name:var(--font-playfair)] text-[1.2rem] font-bold leading-snug text-white">
                {instructor.name}
              </h2>
              <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[0.8rem] text-white/55">
                {instructor.title}
              </p>
              <span
                className="mt-3 inline-flex border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] px-2.5 py-1 font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-semibold uppercase tracking-wide text-white"
              >
                {instructor.yearsExp} yrs experience
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center border border-[rgba(255,255,255,0.2)] text-white transition-colors hover:bg-[rgba(255,255,255,0.08)]"
              aria-label="Close profile"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="h-1 w-full" style={{ backgroundColor: accent }} />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 py-6 sm:px-6">
            <p className={cn(courseBodyClass, "max-w-prose")}>{instructor.bio}</p>
          </div>

          {profile?.experience && profile.experience.length > 0 ? (
            <>
              <div className="mx-5 h-px bg-[rgba(47,78,64,0.08)] sm:mx-6" />
              <div className="px-5 py-6 sm:px-6">
                <div className="mb-5 flex items-center gap-2">
                  <Briefcase
                    className="h-4 w-4 shrink-0 text-(--brand-brown)"
                    strokeWidth={1.75}
                  />
                  <p className={courseEyebrowClass}>Experience</p>
                </div>

                <div className="relative pl-5">
                  <div
                    className="absolute top-2 bottom-2 left-[7px] w-px"
                    style={{ backgroundColor: courseAccentAlpha(accent, 35) }}
                  />
                  <div className="flex flex-col gap-5">
                    {profile.experience.map((exp, index) => (
                      <div key={index} className="relative">
                        <div
                          className="absolute top-1.5 -left-5 h-2.5 w-2.5 border-2 border-(--brand-cream)"
                          style={{ backgroundColor: accent }}
                        />
                        <p className="font-[family-name:var(--font-dm-sans)] text-[0.88rem] font-semibold text-(--brand-green)">
                          {exp.role}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="font-[family-name:var(--font-dm-sans)] text-[0.8rem] text-[rgba(47,78,64,0.55)]">
                            {exp.place}
                          </span>
                          {exp.period ? (
                            <span
                              className="border px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-medium"
                              style={{
                                borderColor: courseAccentAlpha(accent, 35),
                                backgroundColor: courseAccentAlpha(accent, 10),
                                color: accent,
                              }}
                            >
                              {exp.period}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {profile?.expertise && profile.expertise.length > 0 ? (
            <>
              <div className="mx-5 h-px bg-[rgba(47,78,64,0.08)] sm:mx-6" />
              <div className="px-5 py-6 sm:px-6">
                <div className="mb-5 flex items-center gap-2">
                  <Sparkles
                    className="h-4 w-4 shrink-0 text-(--brand-brown)"
                    strokeWidth={1.75}
                  />
                  <p className={courseEyebrowClass}>Core Expertise</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="border px-3 py-1.5 font-[family-name:var(--font-dm-sans)] text-[0.78rem] font-medium text-(--brand-green)"
                      style={{
                        borderColor: courseAccentAlpha(accent, 30),
                        backgroundColor: courseAccentAlpha(accent, 8),
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
