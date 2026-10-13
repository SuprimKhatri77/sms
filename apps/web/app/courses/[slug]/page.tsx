import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  CertificateIcon,
  ChatCircleTextIcon,
  HandshakeIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/ssr";
import { getCourseBySlug, courses, listedCourses } from "@/utils/mock";
import { siteInfo } from "@/utils/site-info";
import CourseClientShells from "@/components/courses/CourseClientShells";
import { CourseSectionHeading } from "@/components/courses/CourseSectionHeading";
import { CurriculumAccordion } from "@/components/courses/CurriculumAccordion";
import { VideoPlayer } from "@/components/courses/VideoPlayer";
import { FaqList } from "@/components/courses/FAQ";
import { InstructorSection } from "@/components/courses/InstructorSection";
import { ReadMoreText } from "@/components/courses/ReadMoreText";
import { MobileEnrolBar } from "@/components/courses/MobileEnrolBar";
import {
  COURSE_PRICE_VAT_NOTE,
  courseTones,
} from "@/components/courses/course-styles";
import ClosingCta from "@/components/landing/ClosingCta";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ButtonArrow, siteButton } from "@/components/site/button";
import { SectionHeading } from "@/components/site/section-heading";
import { createCourseJsonLd, createCourseMetadata } from "@/lib/seo";
import { CourseCard } from "@/modules/courses/CourseCard";
import {
  formatFee,
  getCourseFee,
  getCourseFees,
} from "@/modules/courses/course-fees";
import { cn } from "@/lib/utils";

export type IconKey = "coffee" | "bartending" | "bakery" | "sushi";

const HERO_CTA_ID = "course-hero-cta";
const ENROL_CARD_ID = "course-enrol";

/* Clears the site header and the sticky section nav (h-12) when a section
   is jumped to. */
const sectionClass = "scroll-mt-16";

// Only the courses in utils/mock.ts exist; anything else is a real 404
// (notFound() alone would stream a 200 behind loading.tsx).
export const dynamicParams = false;

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

/** "Professional Barista Program" → "Professional Barista" + "Program." */
function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const last = words.pop() ?? title;
  return { lead: words.join(" "), last };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Unknown slugs 404 before anything is fetched.
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const [fee, allFees] = await Promise.all([
    getCourseFee(slug),
    getCourseFees(),
  ]);
  const feeLabel = fee != null ? formatFee(fee) : "Fee on request";

  const tone = courseTones[course.icon];
  const { lead, last } = splitTitle(course.course);
  const otherCourses = listedCourses
    .filter((c) => c.slug !== course.slug)
    .slice(0, 3);
  const whatsappHref = `https://wa.me/${siteInfo.contact.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi, I'd like to know more about the ${course.name} course.`,
  )}`;

  const metaItems = [
    { label: "Duration", value: course.duration },
    { label: "Level", value: course.difficulty },
    { label: "Class size", value: `Max ${course.seats}` },
    { label: "Next intake", value: course.startDates[0] },
  ];

  const trust = [
    { icon: CertificateIcon, text: "Certificate on completion" },
    {
      icon: UsersThreeIcon,
      text: `Small cohorts of up to ${course.seats} students`,
    },
    { icon: HandshakeIcon, text: "Placement support after graduation" },
  ];

  return (
    <main id="main-content" className="font-site text-ink">
      <JsonLd data={createCourseJsonLd(course)} />

      {/* ── Hero ── */}
      <section
        aria-labelledby="course-hero-heading"
        className="container-page grid gap-10 pt-10 pb-14 sm:pt-14 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-16"
      >
        <div className="space-y-7 lg:col-span-6">
          <Breadcrumbs
            className="animate-rise"
            items={[
              { label: "Home", href: "/" },
              { label: "Courses", href: "/courses" },
              { label: course.name },
            ]}
          />
          <p
            className="eyebrow animate-rise"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            <span
              aria-hidden
              className="mr-2 inline-block size-1.5 translate-y-[-1px] rounded-full"
              style={{ backgroundColor: tone.accent }}
            />
            {course.tagline}
          </p>
          <h1
            id="course-hero-heading"
            className="display animate-rise text-[clamp(3.25rem,7vw,6.5rem)] text-ink"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            {lead ? `${lead} ` : null}
            <em>{last}.</em>
          </h1>
          <div
            className="animate-rise"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <ReadMoreText text={course.longDescription} />
          </div>
          <div
            className="animate-rise flex flex-wrap items-center gap-x-7 gap-y-4"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <Link
              id={HERO_CTA_ID}
              href="/admission"
              className={siteButton({ variant: "pine", size: "lg" })}
            >
              Apply now
              <ButtonArrow />
            </Link>
            <Link
              href="/#inquiry"
              className="link-underline text-[0.8125rem] text-ink outline-none"
            >
              Talk to an advisor
            </Link>
          </div>
          <dl
            aria-label="Program details"
            className="animate-rise grid grid-cols-2 border-t border-hairline sm:grid-cols-4"
            style={{ "--i": 5 } as React.CSSProperties}
          >
            {metaItems.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-1.5 border-hairline py-4 pr-3 not-first:sm:border-l not-first:sm:pl-4 even:border-l even:pl-4 nth-[n+3]:border-t sm:nth-[n+3]:border-t-0"
              >
                <dt className="font-label text-[0.625rem] tracking-[0.14em] text-ink-muted uppercase">
                  {label}
                </dt>
                <dd className="text-[0.875rem] leading-snug text-ink">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-[16/11] lg:col-span-6 lg:aspect-[5/6] lg:max-h-[calc(100svh-var(--header-h)-4rem)] lg:w-full">
          <Image
            src={course.videoPlaceholder}
            alt={`${course.name} training at ${siteInfo.company.shortName}`}
            fill
            preload
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="animate-hero-settle object-cover"
          />
        </div>
      </section>

      <CourseClientShells
        toneKey={course.icon}
        showInstructor={course.instructors.length > 0}
      />

      {/* ── Body ── */}
      <div className="container-page grid gap-16 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
        <div className="min-w-0 space-y-20 sm:space-y-28">
          <section
            id="video"
            aria-labelledby="course-video-heading"
            className={sectionClass}
          >
            <CourseSectionHeading
              id="course-video-heading"
              eyebrow="Program preview"
              title={
                <>
                  Inside the <em>training lab.</em>
                </>
              }
            />
            <VideoPlayer course={course} />
            <p className="mt-6 max-w-prose text-[0.9375rem] leading-relaxed text-ink-muted">
              See how our {course.name.toLowerCase()} sessions run: real
              equipment, guided practice, and the pace you can expect in class.
            </p>
          </section>

          <section
            id="overview"
            aria-labelledby="course-overview-heading"
            className={sectionClass}
          >
            <CourseSectionHeading
              id="course-overview-heading"
              eyebrow="About this program"
              title={
                <>
                  Learn and <em>become.</em>
                </>
              }
            />
            <p className="max-w-prose text-[0.9375rem] leading-relaxed text-ink-muted">
              {course.longDescription}
            </p>
            <h3 className="eyebrow mt-12 mb-2">What you&apos;ll be able to do</h3>
            <ol className="border-t border-hairline">
              {course.outcomes.map((outcome, i) => (
                <li
                  key={outcome}
                  className="grid grid-cols-[2.5rem_1fr] items-baseline border-b border-hairline py-4"
                >
                  <span className="font-label text-[0.6875rem] tracking-[0.12em] text-ink-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.9375rem] leading-relaxed text-ink">
                    {outcome}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section
            id="curriculum"
            aria-labelledby="course-curriculum-heading"
            className={sectionClass}
          >
            <CourseSectionHeading
              id="course-curriculum-heading"
              eyebrow="Week by week"
              title={
                <>
                  The full <em>curriculum.</em>
                </>
              }
            />
            <CurriculumAccordion course={course} accent={tone.accent} />
          </section>

          {course.instructors.length > 0 ? (
            <section
              id="instructor"
              aria-labelledby="course-instructor-heading"
              className={sectionClass}
            >
              <InstructorSection
                instructors={course.instructors}
                accent={tone.accent}
              />
            </section>
          ) : null}

          <section
            id="faq"
            aria-labelledby="course-faq-heading"
            className={sectionClass}
          >
            <CourseSectionHeading
              id="course-faq-heading"
              eyebrow="Common questions"
              title={
                <>
                  Good to <em>know.</em>
                </>
              }
            />
            <FaqList course={course} />
          </section>
        </div>

        {/* ── Enrol card ── */}
        <aside
          aria-labelledby="course-enrol-heading"
          className="lg:sticky lg:top-[calc(var(--header-h)+5rem)] lg:self-start"
        >
          <div
            id={ENROL_CARD_ID}
            className="border border-hairline bg-surface p-6 sm:p-8"
          >
            <h2 id="course-enrol-heading" className="eyebrow">
              Course fee
            </h2>
            <p className="mt-3 font-display text-5xl leading-none text-ink tabular-nums">
              {feeLabel}
            </p>
            {fee != null ? (
              <p className="mt-2 text-[0.75rem] text-ink-muted">
                {COURSE_PRICE_VAT_NOTE} · Full program, materials included
              </p>
            ) : (
              <p className="mt-2 text-[0.75rem] text-ink-muted">
                Ask us for the current fee and payment options.
              </p>
            )}

            <div className="mt-7 border-t border-hairline pt-5">
              <p className="eyebrow">Start dates</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {course.startDates.map((date, i) => (
                  <li
                    key={date}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[0.75rem]",
                      i === 0
                        ? "border-ink bg-ink text-paper"
                        : "border-hairline text-ink",
                    )}
                  >
                    {date}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 grid gap-2">
              <Link
                href="/admission"
                className={cn(
                  siteButton({ variant: "pine", size: "lg" }),
                  "w-full",
                )}
              >
                Apply now
                <ButtonArrow />
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  siteButton({ variant: "outline", size: "lg" }),
                  "w-full",
                )}
              >
                <ChatCircleTextIcon weight="light" className="size-4" />
                Talk to an advisor
              </a>
            </div>

            <ul className="mt-7 space-y-3 border-t border-hairline pt-5">
              {trust.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 text-[0.8125rem] text-ink"
                >
                  <Icon
                    aria-hidden
                    weight="light"
                    className="size-5 shrink-0 text-clay"
                  />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* ── Other courses ── */}
      {otherCourses.length > 0 ? (
        <section
          aria-labelledby="other-courses-heading"
          className="border-t border-hairline bg-paper"
        >
          <div className="container-page py-20 sm:py-28">
            <SectionHeading
              id="other-courses-heading"
              eyebrow="Keep exploring"
              title={
                <>
                  Other <em>courses.</em>
                </>
              }
              href="/courses"
              linkLabel="View all courses"
            />
            <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {otherCourses.map((other, i) => (
                <CourseCard
                  key={other.slug}
                  course={other}
                  fee={allFees?.get(other.name.toLowerCase())}
                  index={i}
                  headingLevel="h3"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ClosingCta
        applyHref="/admission"
        secondary={{ href: "/#inquiry", label: "Talk to an advisor" }}
      />

      <MobileEnrolBar
        name={course.name}
        feeLabel={feeLabel}
        heroCtaId={HERO_CTA_ID}
        enrolCardId={ENROL_CARD_ID}
      />
    </main>
  );
}
