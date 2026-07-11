import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { getCourseBySlug, courses } from "@/utils/mock";
import CourseClientShells from "@/components/courses/CourseClientShells";
import { SectionLabel } from "@/components/courses/SectionLabel";
import { CurriculumAccordion } from "@/components/courses/CurriculumAccordion";
import { VideoPlayer } from "@/components/courses/VideoPlayer";
import { FaqList } from "@/components/courses/FAQ";
import { getApiUrl } from "@/lib/api-url";
import {
  Coffee,
  GlassWater,
  CroissantIcon,
  UtensilsCrossed,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { createCourseJsonLd, createCourseMetadata } from "@/lib/seo";
import { CourseDetailResponse } from "@repo/types";
import { InstructorSection } from "@/components/courses/InstructorSection";
import { ReadMoreText } from "@/components/courses/ReadMoreText";
import { CoursePriceVatNote } from "@/components/courses/CoursePriceVatNote";
import {
  courseBodyClass,
  courseContainerClass,
  courseCreamSection,
  courseMutedSection,
  coursePrimaryBtnClass,
  courseSecondaryBtnClass,
  courseSectionClass,
  courseTitleClass,
  courseTones,
  type CourseToneKey,
} from "@/components/courses/course-styles";
import { cn } from "@/lib/utils";

const iconMap = {
  coffee: Coffee,
  bartending: GlassWater,
  bakery: CroissantIcon,
  sushi: UtensilsCrossed,
} as const;

export type IconKey = keyof typeof iconMap;

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Course Not Found" };
  return createCourseMetadata(course);
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetch(`${getApiUrl()}/api/v1/courses/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch course data");
  const data = (await res.json()) as CourseDetailResponse;
  if (!data.success) throw new Error(data.message);

  const courseFee = data.data.fee / 100;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const { icon, ...safeCourse } = course;
  const Icon = iconMap[icon];
  const tone = courseTones[icon as CourseToneKey];
  const formatter = new Intl.NumberFormat("en-NP");

  const metaItems = [
    { icon: Clock, label: "Duration", value: course.duration },
    { icon: BarChart2, label: "Level", value: course.difficulty },
    { icon: Users, label: "Class size", value: `Max ${course.seats}` },
    { icon: Calendar, label: "Next intake", value: course.startDates[0] },
  ] as const;

  return (
    <main
      id="main-content"
      className="min-h-screen bg-(--brand-cream) font-(family-name:--font-dm-sans) text-(--brand-ink)"
    >
      <JsonLd data={createCourseJsonLd(course)} />
      {/* ── Hero ── */}
      <section
        aria-labelledby="course-hero-heading"
        className="relative overflow-hidden bg-(--brand-green) px-6 pb-16 pt-28 sm:pb-20 sm:pt-32"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ background: "rgba(194,138,79,0.2)" }}
          aria-hidden
        />

        <div className={cn(courseContainerClass, "relative")}>
          <Link
            href="/#programs"
            aria-label="Back to all training programs"
            className="mb-8 inline-flex items-center gap-2 font-(family-name:--font-dm-sans) text-[0.82rem] font-medium text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            All programs
          </Link>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div
              className="grid h-11 w-11 place-items-center border"
              aria-hidden
              style={{
                borderColor: tone.border,
                backgroundColor: tone.soft,
                color: tone.accent,
              }}
            >
              <Icon size={20} strokeWidth={1.75} />
            </div>
            <span
              className="border px-3 py-1 font-(family-name:--font-dm-sans) text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
              style={{
                borderColor: tone.border,
                backgroundColor: tone.soft,
                color: tone.accent,
              }}
            >
              {course.tagline}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px] lg:items-end lg:gap-12">
            <div>
              <h1
                id="course-hero-heading"
                className="mb-4 font-[family-name:var(--font-playfair)] text-[clamp(2.2rem,5vw,3.5rem)] font-bold leading-[1.08] text-white"
              >
                {course.course}
              </h1>
              <ReadMoreText text={course.longDescription} />
              <div className="flex flex-wrap gap-3">
                <Link href="/admission" className={coursePrimaryBtnClass}>
                  Apply Now
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <Link href="/#inquiry" className={courseSecondaryBtnClass}>
                  Talk to an Advisor
                </Link>
              </div>
            </div>

            <div
              className="grid grid-cols-2 gap-2.5 sm:gap-3"
              role="list"
              aria-label="Program details"
            >
              {metaItems.map(({ icon: MetaIcon, label, value }) => (
                <div
                  key={label}
                  role="listitem"
                  className="border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-4"
                >
                  <MetaIcon
                    className="mb-2 h-4 w-4 text-white/40"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <p className="mb-0.5 font-(family-name:--font-dm-sans) text-[0.68rem] uppercase tracking-widest text-white/40">
                    {label}
                  </p>
                  <p className="font-(family-name:--font-dm-sans) text-[0.88rem] font-semibold text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CourseClientShells toneKey={icon as CourseToneKey} />

      {/* ── Video (featured) ── */}
      <section
        id="video"
        aria-labelledby="course-video-heading"
        className={cn(courseSectionClass, courseCreamSection)}
      >
        <div className={courseContainerClass}>
          <div className="mb-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12">
            <div>
              <SectionLabel>Program Preview</SectionLabel>
              <h2 id="course-video-heading" className={courseTitleClass}>
                <em
                  className="font-medium text-(--brand-brown)"
                  style={{ fontStyle: "italic" }}
                >
                  Training Lab
                </em>
              </h2>
              <p className={cn(courseBodyClass, "mt-4 max-w-lg")}>
                See how our {course.course.toLowerCase()} sessions run — real
                equipment, guided practice, and the pace you can expect in class.
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {[
                  "Hands-on demonstrations from working professionals",
                  "Small cohorts with direct instructor feedback",
                  "Industry-standard tools and workflows",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 font-(family-name:--font-dm-sans) text-[0.88rem] text-[rgba(47,78,64,0.65)]"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-(--brand-brown)"
                      strokeWidth={2}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <VideoPlayer course={course} />
          </div>
        </div>
      </section>

      {/* ── Overview ── */}
      <section
        id="overview"
        aria-labelledby="course-overview-heading"
        className={cn(courseSectionClass, courseMutedSection)}
      >
        <div className={courseContainerClass}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
            <div>
              <SectionLabel>About This Program</SectionLabel>
              <h2 id="course-overview-heading" className={courseTitleClass}>
                <em
                  className="font-medium text-(--brand-brown)"
                  style={{ fontStyle: "italic" }}
                >
                  Learn & Become
                </em>
              </h2>
              <p className={cn(courseBodyClass, "mt-5 max-w-prose")}>
                {course.longDescription}
              </p>

              <div className="mt-10">
                <div
                  className="inline-flex flex-col gap-1 border px-6 py-4"
                  style={{
                    borderColor: tone.border,
                    backgroundColor: tone.soft,
                  }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.5)]">
                      NPR
                    </span>
                    <span className="font-(family-name:--font-lora) text-[2rem] font-bold tracking-tight text-(--brand-green)">
                      {formatter.format(courseFee)}
                    </span>
                  </div>
                  <span className="font-(family-name:--font-dm-sans) text-[0.8rem] text-[rgba(47,78,64,0.5)]">
                    Full program · materials included
                  </span>
                </div>
                <CoursePriceVatNote className="mt-2" />
              </div>
            </div>

            <div className="border border-[rgba(47,78,64,0.1)] bg-white p-6 sm:p-7">
              <div className="mb-5 flex items-center gap-2.5">
                <Award
                  className="h-4 w-4 text-(--brand-green)"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <h3 className="font-(family-name:--font-dm-sans) text-[0.95rem] font-semibold text-(--brand-green)">
                  Learning Outcomes
                </h3>
              </div>
              <ul className="flex flex-col gap-3.5">
                {course.outcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex items-start gap-3 font-(family-name:--font-dm-sans) text-[0.875rem] leading-[1.6] text-[rgba(47,78,64,0.65)]"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: tone.accent }}
                      strokeWidth={2}
                      aria-hidden
                    />
                    {outcome}
                  </li>
                ))}
              </ul>

              <div className="mt-7 border-t border-[rgba(47,78,64,0.08)] pt-6">
                <p className="mb-3 font-(family-name:--font-dm-sans) text-[0.72rem] font-semibold uppercase tracking-widest text-[rgba(47,78,64,0.4)]">
                  Upcoming start dates
                </p>
                <ul className="flex flex-col gap-2">
                  {course.startDates.map((date, i) => (
                    <li
                      key={date}
                      className="flex items-start justify-between gap-3 font-(family-name:--font-dm-sans) text-[0.875rem]"
                    >
                      <span className="min-w-0 flex-1 leading-snug text-[rgba(47,78,64,0.65)]">
                        {date}
                      </span>
                      {i === 0 ? (
                        <span
                          className="shrink-0 whitespace-nowrap border px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide"
                          style={{
                            borderColor: tone.border,
                            color: tone.accent,
                            backgroundColor: tone.soft,
                          }}
                        >
                          Next intake
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curriculum ── */}
      <section
        id="curriculum"
        aria-labelledby="course-curriculum-heading"
        className={cn(courseSectionClass, courseCreamSection)}
      >
        <div className={courseContainerClass}>
          <SectionLabel>Week by Week</SectionLabel>
          <h2 id="course-curriculum-heading" className={cn(courseTitleClass, "mb-10")}>
            Full Curriculum
          </h2>
          <CurriculumAccordion course={course} accent={tone.accent} />
        </div>
      </section>

      {/* ── Instructor ── */}
      <section
        id="instructor"
        aria-labelledby="course-instructor-heading"
        className={cn(courseSectionClass, courseMutedSection)}
      >
        <InstructorSection course={safeCourse} accent={tone.accent} />
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        aria-labelledby="course-faq-heading"
        className={cn(courseSectionClass, courseCreamSection)}
      >
        <div className={courseContainerClass}>
          <SectionLabel>Common Questions</SectionLabel>
          <h2 id="course-faq-heading" className={cn(courseTitleClass, "mb-10")}>
            FAQ
          </h2>
          <FaqList course={course} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={cn(courseSectionClass, "pb-24 pt-4", courseCreamSection)}>
        <div className={courseContainerClass}>
          <div className="overflow-hidden border border-[rgba(47,78,64,0.12)] bg-(--brand-green)">
            <div
              className="h-1 w-full"
              style={{ backgroundColor: tone.accent }}
            />
            <div className="flex flex-col items-start justify-between gap-8 px-6 py-10 sm:flex-row sm:items-center sm:px-10 sm:py-12">
              <div>
                <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.5rem,3vw,2rem)] font-bold leading-tight text-white">
                  Ready to begin your{" "}
                  <em
                    className="font-medium text-(--brand-brown)"
                    style={{ fontStyle: "italic" }}
                  >
                    {course.course} journey?
                  </em>
                </h2>
                <p className="mt-2 font-(family-name:--font-dm-sans) text-[0.9rem] text-white/55">
                  Next cohort starts {course.startDates[0]} · Only{" "}
                  {course.seats} seats per intake.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link href="/admission" className={coursePrimaryBtnClass}>
                  Apply Now
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <Link href="/#inquiry" className={courseSecondaryBtnClass}>
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
