import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  BarChart2,
  BookOpen,
  Award,
} from "lucide-react";
import { getCourseBySlug, courses } from "@/utils/mock";
import CourseClientShells from "../../../components/courses/CourseClientShells";
import { SectionLabel } from "@/components/courses/SectionLabel";
import { CurriculumAccordion } from "../../../components/courses/CurriculumAccordion";
import { VideoPlayer } from "@/components/courses/VideoPlayer";
import { FaqList } from "../../../components/courses/FAQ";

// ─── Static params ────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Course Not Found" };
  return {
    title: `${course.course} Program — ${siteInfo.company.name}`,
    description: course.shortDescription,
  };
}

import {
  Coffee,
  GlassWater,
  CroissantIcon,
  UtensilsCrossed,
} from "lucide-react";
import { siteInfo } from "@/utils/site-info";

const iconMap = {
  coffee: Coffee,
  bartending: GlassWater,
  bakery: CroissantIcon,
  sushi: UtensilsCrossed,
} as const;
export type IconKey = keyof typeof iconMap;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const { icon, ...safeCourse } = course;
  const Icon = iconMap[icon];
  const formatter = new Intl.NumberFormat("en-NP");

  return (
    <main
      className="min-h-screen py-10"
      style={{
        fontFamily: "var(--font-dm-sans)",
        backgroundColor: "var(--brand-cream, #fbfaf7)",
        color: "var(--brand-ink, #1a1a1a)",
      }}
    >
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-6 pb-20 pt-16"
        style={{ backgroundColor: "var(--brand-green, #2f4e40)" }}
      >
        {/* Dot texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Accent glow */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-125 w-125 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${course.color} 0%, transparent 70%)`,
          }}
        />

        <div className="relative mx-auto max-w-6xl">
          {/* Badge */}
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${course.color}20` }}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={1.75}
                style={{ color: course.color }}
              />
            </div>
            <span
              className="rounded-full border px-3 py-1 text-[0.75rem] font-semibold tracking-[0.06em] uppercase"
              style={{
                borderColor: `${course.color}50`,
                backgroundColor: `${course.color}15`,
                color: course.color,
              }}
            >
              {course.tagline}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-end">
            {/* Left: title + description */}
            <div>
              <h1
                className="mb-5 text-[clamp(2.4rem,5vw,3.8rem)] font-bold leading-[1.1] text-white"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {course.course}
                <br />
                <em
                  className="font-normal italic"
                  style={{ color: "var(--brand-brown, #c28a4f)" }}
                >
                  {course.tagline}
                </em>
              </h1>
              <p className="mb-8 max-w-lg text-[1rem] leading-[1.75] text-white/60">
                {course.longDescription.slice(0, 220)}…
              </p>

              {/* CTA row */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admission"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[0.875rem] font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-white"
                  style={{
                    backgroundColor: course.color,
                    boxShadow: `0 4px 20px ${course.color}40`,
                  }}
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
                <Link
                  href="/#inquiry"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-6 py-3.5 text-[0.875rem] font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/35 hover:bg-white/14 focus-visible:outline focus-visible:outline-white"
                >
                  Talk to an Advisor
                </Link>
              </div>
            </div>

            {/* Right: meta cards */}
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  {
                    icon: Clock,
                    label: "Duration",
                    value: course.duration,
                  },
                  {
                    icon: BarChart2,
                    label: "Level",
                    value: course.difficulty,
                  },
                  {
                    icon: Users,
                    label: "Cohort size",
                    value: `Max ${course.seats} students`,
                  },
                  {
                    icon: Calendar,
                    label: "Next intake",
                    value: course.startDates[0],
                  },
                ] as const
              ).map(({ icon: MetaIcon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm"
                >
                  <MetaIcon
                    className="mb-2 h-4 w-4 text-white/40"
                    strokeWidth={1.75}
                  />
                  <p className="mb-0.5 text-[0.75rem] text-white/40 uppercase tracking-widest">
                    {label}
                  </p>
                  <p className="text-[0.92rem] font-semibold text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Client shells (sticky nav + interactive sections) ──────────────── */}
      {/* Separated into a client component to keep this file a Server Component */}
      <CourseClientShells course={safeCourse} />

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      <section
        className="border-y px-6 py-12"
        style={{
          borderColor: "rgba(0,0,0,0.07)",
          backgroundColor: "#f3f1eb",
        }}
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
          {course.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="mb-1 text-[2rem] font-bold leading-none tracking-tight"
                style={{
                  color: "var(--brand-green, #2f4e40)",
                  fontFamily: "var(--font-lora)",
                }}
              >
                {stat.value}
              </p>
              <p className="text-[0.8rem] text-black/45 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Overview: long description + outcomes ──────────────────────────── */}
      <section
        id="overview"
        className="scroll-mt-20 px-6 py-20"
        style={{ backgroundColor: "var(--brand-cream, #fbfaf7)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_400px]">
            {/* Description */}
            <div>
              <SectionLabel>About This Program</SectionLabel>
              <h2
                className="mb-6 text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-[1.2]"
                style={{
                  fontFamily: "var(--font-lora)",
                  color: "var(--brand-ink, #1a1a1a)",
                }}
              >
                What You Will{" "}
                <em
                  className="font-normal italic"
                  style={{ color: "var(--brand-brown, #c28a4f)" }}
                >
                  Learn & Become
                </em>
              </h2>
              <p
                className="text-[1rem] leading-[1.85] text-black/60"
                style={{ maxWidth: "62ch" }}
              >
                {course.longDescription}
              </p>

              {/* Tuition callout */}
              <div
                className="mt-10 inline-flex items-baseline gap-3 rounded-2xl border px-6 py-4"
                style={{
                  borderColor: `${course.color}30`,
                  backgroundColor: `${course.color}08`,
                }}
              >
                <span
                  className="text-[2rem] font-bold tracking-tight"
                  style={{
                    color: "var(--brand-ink, #1a1a1a)",
                    fontFamily: "var(--font-lora)",
                  }}
                >
                  NPR {formatter.format(course.tuitionNPR)}
                </span>
                <span className="text-[0.85rem] text-black/45">
                  full program · materials included
                </span>
              </div>
            </div>

            {/* Outcomes */}
            <div>
              <div
                className="rounded-2xl border p-7"
                style={{
                  borderColor: "rgba(0,0,0,0.07)",
                  backgroundColor: "#f3f1eb",
                }}
              >
                <div className="mb-5 flex items-center gap-2.5">
                  <Award
                    className="h-4.5 w-4.5"
                    style={{ color: "var(--brand-green, #2f4e40)" }}
                    strokeWidth={1.75}
                  />
                  <h3
                    className="text-[0.95rem] font-semibold"
                    style={{ color: "var(--brand-ink, #1a1a1a)" }}
                  >
                    Learning Outcomes
                  </h3>
                </div>
                <ul className="flex flex-col gap-3.5">
                  {course.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-3 text-[0.875rem] leading-[1.6] text-black/65"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: course.color }}
                        strokeWidth={2}
                      />
                      {outcome}
                    </li>
                  ))}
                </ul>

                {/* Intake dates */}
                <div
                  className="mt-7 border-t pt-6"
                  style={{ borderColor: "rgba(0,0,0,0.07)" }}
                >
                  <p className="mb-3 text-[0.75rem] font-semibold uppercase tracking-widest text-black/35">
                    Upcoming Start Dates
                  </p>
                  <ul className="flex flex-col gap-2">
                    {course.startDates.map((date, i) => (
                      <li
                        key={date}
                        className="flex items-center justify-between text-[0.875rem]"
                      >
                        <span className="text-black/65">{date}</span>
                        {i === 0 && (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold"
                            style={{
                              backgroundColor: `${course.color}15`,
                              color: course.color,
                            }}
                          >
                            Next intake
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curriculum ─────────────────────────────────────────────────────── */}
      {/* <section
        id="curriculum"
        className="scroll-mt-20 px-6 py-20"
        style={{ backgroundColor: "#f3f1eb" }}
      >
        <div className="mx-auto max-w-4xl">
          <SectionLabel>Week by Week</SectionLabel>
          <h2
            className="mb-12 text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-[1.2]"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--brand-ink, #1a1a1a)",
            }}
          >
            Full Curriculum
          </h2>

          <CurriculumAccordion course={course} />
        </div>
      </section> */}

      {/* ── Video section ──────────────────────────────────────────────────── */}
      <section
        id="video"
        className="scroll-mt-20 px-6 py-20"
        style={{ backgroundColor: "var(--brand-cream, #fbfaf7)" }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <SectionLabel centered>See It In Action</SectionLabel>
            <h2
              className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-[1.2]"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--brand-ink, #1a1a1a)",
              }}
            >
              Inside the{" "}
              <em
                className="font-normal italic"
                style={{ color: "var(--brand-brown, #c28a4f)" }}
              >
                {course.course} Lab
              </em>
            </h2>
          </div>

          <VideoPlayer course={course} />
        </div>
      </section>

      {/* ── Instructor ─────────────────────────────────────────────────────── */}
      <section
        id="instructor"
        className="scroll-mt-20 px-6 py-20"
        style={{ backgroundColor: "#f3f1eb" }}
      >
        <div className="mx-auto max-w-5xl">
          <SectionLabel>Your Instructor</SectionLabel>
          <div className="mt-10 grid grid-cols-1 items-center gap-12 sm:grid-cols-[220px_1fr]">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
              <div
                className="h-36 w-36 rounded-2xl sm:h-44 sm:w-44"
                style={{
                  backgroundColor: course.instructor.imagePlaceholder,
                  opacity: 0.25,
                }}
                aria-hidden
              />
              <div>
                <p
                  className="text-[1.15rem] font-bold"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    color: "var(--brand-ink, #1a1a1a)",
                  }}
                >
                  {course.instructor.name}
                </p>
                <p className="mt-1 text-[0.82rem] text-black/45">
                  {course.instructor.title}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <p
                className="mb-6 text-[1rem] leading-[1.85] text-black/60"
                style={{ maxWidth: "60ch" }}
              >
                {course.instructor.bio}
              </p>
              <div className="flex items-center gap-3">
                <BookOpen
                  className="h-4 w-4"
                  style={{ color: "var(--brand-green, #2f4e40)" }}
                  strokeWidth={1.75}
                />
                <span className="text-[0.875rem] text-black/55">
                  <strong style={{ color: "var(--brand-ink, #1a1a1a)" }}>
                    {course.instructor.yearsExp} years
                  </strong>{" "}
                  of industry experience
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQs ───────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="scroll-mt-20 px-6 py-20"
        style={{ backgroundColor: "var(--brand-cream, #fbfaf7)" }}
      >
        <div className="mx-auto max-w-3xl">
          <SectionLabel centered>Frequently Asked</SectionLabel>
          <h2
            className="mb-12 text-center text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-[1.2]"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--brand-ink, #1a1a1a)",
            }}
          >
            Questions
          </h2>

          <FaqList course={course} />
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
      <section
        className="px-6 pb-24 pt-4"
        style={{ backgroundColor: "var(--brand-cream, #fbfaf7)" }}
      >
        <div
          className="mx-auto max-w-5xl overflow-hidden rounded-3xl"
          style={{ backgroundColor: "var(--brand-green, #2f4e40)" }}
        >
          {/* Accent bar */}
          <div
            className="h-1 w-full"
            style={{ backgroundColor: course.color }}
          />
          <div className="px-8 py-12 sm:px-14 sm:py-14">
            <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  className="mb-2 text-[1.6rem] font-bold leading-[1.2] text-white sm:text-[2rem]"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Ready to begin your{" "}
                  <em
                    className="font-normal italic"
                    style={{ color: "var(--brand-brown, #c28a4f)" }}
                  >
                    {course.course} journey?
                  </em>
                </h2>
                <p className="text-[0.9rem] text-white/50">
                  Next cohort starts {course.startDates[0]} · Only{" "}
                  {course.seats} seats per intake.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/admission"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[0.875rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-white"
                  style={{
                    backgroundColor: course.color,
                    boxShadow: `0 4px 20px ${course.color}45`,
                  }}
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
                <Link
                  href="/#inquiry"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-6 py-3.5 text-[0.875rem] font-semibold text-white transition-all duration-200 hover:border-white/35 hover:bg-white/15 focus-visible:outline  focus-visible:outline-white"
                >
                  Ask a Question
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
