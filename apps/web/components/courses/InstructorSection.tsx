"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { InstructorProfileDrawer } from "./InstructorProfileDrawer";
import { InstructorCard } from "./InstructorCard";
import { CourseSectionHeading } from "./CourseSectionHeading";
import { Instructor } from "@/utils/mock";

export function InstructorSection({
  instructors,
  accent,
}: {
  instructors: Instructor[];
  accent: string;
}) {
  const [selected, setSelected] = useState<Instructor | null>(null);
  const isSingle = instructors.length === 1;

  return (
    <>
      <CourseSectionHeading
        id="course-instructor-heading"
        eyebrow={isSingle ? "Your instructor" : "Your instructors"}
        title={
          <>
            Meet your <em>{isSingle ? "mentor." : "mentors."}</em>
          </>
        }
      />

      {isSingle ? (
        <SingleInstructor
          instructor={instructors[0]}
          onViewProfile={() => setSelected(instructors[0])}
        />
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {instructors.map((instructor) => (
            <InstructorCard
              key={instructor.name}
              instructor={instructor}
              onViewProfile={() => setSelected(instructor)}
              sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 26vw, (min-width: 640px) 46vw, 100vw"
            />
          ))}
        </div>
      )}

      {selected ? (
        <InstructorProfileDrawer
          instructor={selected}
          accent={accent}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}

function SingleInstructor({
  instructor,
  onViewProfile,
}: {
  instructor: Instructor;
  onViewProfile: () => void;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-10">
      <div className="relative aspect-[4/5] w-full max-w-60 overflow-hidden bg-surface">
        {instructor.image ? (
          <Image
            src={instructor.image}
            alt={`${instructor.name}, instructor for ${instructor.title} at Brew and Bake Academy Butwal`}
            fill
            className="object-cover object-top"
            sizes="(min-width: 640px) 208px, 240px"
          />
        ) : (
          <div
            className="size-full opacity-35"
            style={{ backgroundColor: instructor.imagePlaceholder }}
            aria-hidden
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="font-label text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
            {instructor.yearsExp} yrs experience
          </p>
          <h3 className="font-display text-3xl leading-tight text-ink">
            {instructor.name}
          </h3>
          <p className="text-[0.8125rem] text-ink-muted">{instructor.title}</p>
        </div>
        <p className="max-w-prose text-[0.9375rem] leading-relaxed text-ink-muted">
          {instructor.bio}
        </p>
        {instructor.hasProfileCard ? (
          <button
            type="button"
            onClick={onViewProfile}
            aria-label={`View full profile of ${instructor.name}`}
            className="group inline-flex items-center gap-2 text-[0.8125rem] text-ink outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
          >
            <span className="link-underline group-hover:bg-size-[100%_1px]">
              View full profile
            </span>
            <ArrowRightIcon
              aria-hidden
              className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}
