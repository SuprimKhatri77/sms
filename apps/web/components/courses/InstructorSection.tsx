"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { InstructorProfileDrawer } from "./InstructorProfileDrawer";
import { Instructor } from "@/utils/mock";
import { SectionLabel } from "./SectionLabel";
import {
  courseBodyClass,
  courseCardClass,
  courseContainerClass,
  courseTitleClass,
} from "./course-styles";
import { cn } from "@/lib/utils";

export function InstructorSection({
  course,
  accent,
}: {
  course: { instructor: Instructor };
  accent: string;
}) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <div className={courseContainerClass}>
        <SectionLabel>Your Instructor</SectionLabel>
        <h2 id="course-instructor-heading" className={cn(courseTitleClass, "mb-8")}>
          Meet Your{" "}
          <em
            className="font-medium text-(--brand-brown)"
            style={{ fontStyle: "italic" }}
          >
            Mentor
          </em>
        </h2>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,240px)_1fr] lg:gap-12">
          <div className="flex flex-col items-start gap-4 text-left">
            <div className="relative h-40 w-40 overflow-hidden border border-[rgba(47,78,64,0.12)] sm:h-44 sm:w-44">
              {course.instructor.image ? (
                <Image
                  src={course.instructor.image}
                  alt={`${course.instructor.name}, instructor for ${course.instructor.title} at Brew and Bake Academy Butwal`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 160px, 176px"
                  priority
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    backgroundColor: course.instructor.imagePlaceholder,
                    opacity: 0.35,
                  }}
                  aria-hidden
                />
              )}
            </div>

            <div>
              <p className="font-[family-name:var(--font-playfair)] text-[1.2rem] font-bold text-(--brand-green)">
                {course.instructor.name}
              </p>
              <p className="mt-1 font-(family-name:--font-dm-sans) text-[0.85rem] text-[rgba(47,78,64,0.5)]">
                {course.instructor.title}
              </p>
            </div>

            {course.instructor.hasProfileCard ? (
              <button
                type="button"
                onClick={() => setShowProfile(true)}
                className="inline-flex items-center gap-2 border border-[rgba(47,78,64,0.18)] bg-white px-5 py-2.5 font-(family-name:--font-dm-sans) text-sm font-semibold text-(--brand-green) transition-colors hover:bg-[rgba(47,78,64,0.04)]"
              >
                View full profile
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            ) : null}
          </div>

          <div className={cn(courseCardClass, "p-6 sm:p-7")}>
            <p className={cn(courseBodyClass, "mb-6 max-w-prose")}>
              {course.instructor.bio}
            </p>
            <div className="flex items-center gap-3 border-t border-[rgba(47,78,64,0.08)] pt-5">
              <BookOpen
                className="h-4 w-4 text-(--brand-brown)"
                strokeWidth={1.75}
              />
              <span className="font-(family-name:--font-dm-sans) text-[0.875rem] text-[rgba(47,78,64,0.62)]">
                <strong className="text-(--brand-green)">
                  {course.instructor.yearsExp} years
                </strong>{" "}
                of industry experience
              </span>
            </div>
          </div>
        </div>
      </div>

      {showProfile ? (
        <InstructorProfileDrawer
          instructor={course.instructor}
          accent={accent}
          onClose={() => setShowProfile(false)}
        />
      ) : null}
    </>
  );
}
