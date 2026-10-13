"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowClockwiseIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/ssr";
import { CoursesList } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { getCourseBySlug } from "@/utils/mock";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { COURSE_PRICE_VAT_NOTE } from "@/components/courses/course-styles";

/**
 * Courses on the landing page, in display order. `name` is how the backend
 * names the course (fees are matched on it); the rest comes from the course
 * detail data.
 */
const programs = [
  { name: "Barista", slug: "barista" },
  { name: "Bakery", slug: "bakery" },
  { name: "Bartending", slug: "bartending" },
  // Sushi is hidden on the landing page for now.
] as const;

async function fetchCourses() {
  const res = await api.get<CoursesList>("/courses");
  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to fetch courses data");
  }
  return res.data.data;
}

type FeeState =
  | { status: "pending" }
  | { status: "error"; retry: () => void; retrying: boolean }
  | { status: "ready"; fee?: number };

export default function Programs() {
  const { data, isError, refetch, isFetching } = useQuery({
    queryKey: ["landing-programs"],
    queryFn: fetchCourses,
    staleTime: 10 * 60 * 1000,
  });

  const feeFor = (name: string): FeeState => {
    // A failed background refetch keeps the fees already loaded; only a
    // first load that failed shows the retry.
    if (data) {
      return {
        status: "ready",
        fee: data.find((c) => c.name === name.toLowerCase())?.fee,
      };
    }
    if (isError) {
      return {
        status: "error",
        retry: () => void refetch(),
        retrying: isFetching,
      };
    }
    return { status: "pending" };
  };

  return (
    <section
      id="programs"
      aria-labelledby="programs-heading"
      className="container-page py-20 font-site sm:py-28"
    >
      <Reveal>
        <SectionHeading
          id="programs-heading"
          eyebrow="Our courses"
          title={
            <>
              Courses that build <em>real careers.</em>
            </>
          }
          description="Practical, hands-on training taught by working professionals, in small cohorts on commercial equipment."
        />
      </Reveal>

      <Stagger className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 lg:grid-rows-[repeat(2,minmax(19rem,1fr))]">
        {programs.map((program, i) => (
          <StaggerItem
            key={program.slug}
            className={cn(
              i === 0
                ? "sm:col-span-2 lg:col-span-7 lg:row-span-2"
                : "lg:col-span-5",
            )}
          >
            <ProgramTile
              name={program.name}
              slug={program.slug}
              index={i}
              feature={i === 0}
              fee={feeFor(program.name)}
            />
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-12 flex flex-col gap-4 border-t border-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl text-ink sm:text-3xl">
            Not sure which course is <em>right for you?</em>
          </p>
          <p className="mt-1 text-[0.8125rem] text-ink-muted">
            Send us an inquiry and our team will guide you through the options.
          </p>
        </div>
        <Link
          href="#inquiry"
          className="group inline-flex shrink-0 items-center gap-2 text-[0.8125rem] text-ink outline-none"
        >
          <span className="link-underline">Talk to an advisor</span>
          <ArrowRightIcon
            aria-hidden
            className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
          />
        </Link>
      </Reveal>
    </section>
  );
}

function ProgramTile({
  name,
  slug,
  index,
  feature,
  fee,
}: {
  name: string;
  slug: string;
  index: number;
  feature: boolean;
  fee: FeeState;
}) {
  const course = getCourseBySlug(slug);

  return (
    <div className="group relative h-full overflow-hidden bg-surface text-paper">
      <div
        className={cn(
          "relative h-full w-full",
          feature
            ? "aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto"
            : "aspect-[4/5] lg:aspect-auto",
        )}
      >
        {course ? (
          <Image
            src={course.videoPlaceholder}
            alt=""
            fill
            sizes={
              feature
                ? "(min-width: 1024px) 58vw, 100vw"
                : "(min-width: 1024px) 42vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.06] motion-reduce:transition-none"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/5"
        />
      </div>

      {/* The whole tile is the link. The caption sits above it but lets
          clicks through, so only the fee retry button catches its own. */}
      <Link
        href={`/courses/${slug}`}
        className="absolute inset-0 z-[1] outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-inset"
      >
        <span className="sr-only">View the {name} course</span>
      </Link>

      <p
        aria-hidden
        className="pointer-events-none absolute top-5 left-5 z-[2] font-label text-[0.6875rem] tracking-[0.16em] text-paper/80 sm:top-6 sm:left-6"
      >
        {String(index + 1).padStart(2, "0")}
      </p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-4 p-5 sm:p-6 lg:p-8">
        <div className="min-w-0 space-y-3">
          {course ? (
            <p className="font-label text-[0.6875rem] tracking-[0.16em] text-paper/80 uppercase">
              {course.duration} · {course.difficulty}
            </p>
          ) : null}
          <h3
            className={cn(
              "font-display leading-[0.95] tracking-[-0.02em]",
              feature ? "text-5xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl",
            )}
          >
            {name}
          </h3>
          {course ? (
            <p
              className={cn(
                "text-[0.875rem] leading-relaxed text-paper/75",
                feature ? "max-w-md" : "max-w-xs",
              )}
            >
              {feature ? course.shortDescription : course.tagline}
            </p>
          ) : null}
          <ProgramFee fee={fee} />
        </div>
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-paper/40 transition-[transform,background-color,color] duration-500 ease-out-expo group-hover:rotate-45 group-hover:bg-paper group-hover:text-ink"
        >
          <ArrowUpRightIcon weight="light" className="size-4" />
        </span>
      </div>
    </div>
  );
}

function ProgramFee({ fee }: { fee: FeeState }) {
  if (fee.status === "pending") {
    return (
      <div aria-hidden className="space-y-1.5 pt-1">
        <div className="skeleton-shimmer h-4 w-32 bg-paper/20" />
        <div className="skeleton-shimmer h-2.5 w-40 bg-paper/15" />
      </div>
    );
  }

  if (fee.status === "error") {
    return (
      <div className="pointer-events-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[0.8125rem] text-paper/80">
        <span>Couldn&apos;t load the fee.</span>
        <button
          type="button"
          onClick={fee.retry}
          disabled={fee.retrying}
          className="inline-flex items-center gap-1.5 text-paper underline underline-offset-4 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-clay disabled:opacity-60"
        >
          <ArrowClockwiseIcon
            aria-hidden
            className={cn("size-3.5", fee.retrying && "animate-spin")}
          />
          {fee.retrying ? "Retrying…" : "Try again"}
        </button>
      </div>
    );
  }

  if (fee.fee == null) {
    return (
      <p className="pt-1 text-[0.8125rem] text-paper/80">
        Contact us for pricing
      </p>
    );
  }

  return (
    <div className="pt-1">
      <p className="font-label text-sm tracking-[0.06em] text-paper tabular-nums">
        NPR {(fee.fee / 100).toLocaleString()}
      </p>
      <p className="mt-0.5 text-[0.6875rem] text-paper/65">
        {COURSE_PRICE_VAT_NOTE}
      </p>
    </div>
  );
}
