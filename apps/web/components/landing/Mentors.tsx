"use client";

import { useState } from "react";
import { InstructorCard } from "@/components/courses/InstructorCard";
import { InstructorProfileDrawer } from "@/components/courses/InstructorProfileDrawer";
import { Instructor, mentors } from "@/utils/mock";
import {
  landingContainerClass,
  landingDarkSectionClass,
  landingEyebrowClass,
  landingSectionBodyClass,
  landingSectionTitleClass,
} from "./landing-styles";
import { cn } from "@/lib/utils";

export default function Mentors() {
  const [selected, setSelected] = useState<Instructor | null>(null);

  return (
    <section
      id="mentors"
      aria-labelledby="mentors-heading"
      className={landingDarkSectionClass}
    >
      <div className={landingContainerClass}>
        <div className="mb-16 max-w-2xl">
          <span className={`${landingEyebrowClass} mb-4 inline-block`}>
            Our Mentors
          </span>
          <h2
            id="mentors-heading"
            className={cn(landingSectionTitleClass, "text-white")}
          >
            Learn From
            <br />
            <em
              className="font-medium text-(--brand-brown)"
              style={{ fontStyle: "italic" }}
            >
              Working Professionals
            </em>
          </h2>
          <p className={cn(landingSectionBodyClass, "mt-4 text-white/65")}>
            Meet the trainers who guide you through every class — experienced
            baristas and bakers with years in the industry.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mentors.map((mentor) => (
            <InstructorCard
              key={mentor.name}
              instructor={mentor}
              onViewProfile={() => setSelected(mentor)}
            />
          ))}
        </div>
      </div>

      {selected ? (
        <InstructorProfileDrawer
          instructor={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </section>
  );
}
