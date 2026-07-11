"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Coffee,
  CroissantIcon,
  GlassWater,
  Users,
} from "lucide-react";
import { CoursesList } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import ProgramsSkeleton from "./programs/ProgramLoadingSkeleton";
import ProgramsError from "./programs/ProgramsError";
import api from "@/lib/axios";
import {
  landingContainerClass,
  landingEyebrowClass,
  landingPrimaryButtonClass,
  landingSectionBodyClass,
  landingSectionTitleClass,
} from "./landing-styles";
import { cn } from "@/lib/utils";
import { CoursePriceVatNote } from "@/components/courses/CoursePriceVatNote";

type ProgramTone = "brown" | "gold" | "green";

type Program = {
  course: string;
  slug: string;
  tagline: string;
  description: string;
  highlights: string[];
  duration: string;
  seats: number;
  icon: typeof Coffee;
  tone: ProgramTone;
  number: string;
  featured?: boolean;
  /** Set false to hide on landing without removing course data */
  showOnLanding?: boolean;
};

const programs: Program[] = [
  {
    course: "Barista",
    slug: "barista",
    tagline: "The Art of Coffee",
    description:
      "Master espresso extraction, milk texturing, latte art, and café workflow — from bean origin to the perfect cup.",
    highlights: [
      "Espresso theory & extraction",
      "Milk steaming & latte art",
      "Café equipment handling",
      "Customer service & menu design",
    ],
    duration: "4 Weeks",
    seats: 16,
    icon: Coffee,
    tone: "brown",
    number: "01",
    featured: true,
  },
  {
    course: "Bakery",
    slug: "bakery",
    tagline: "From Flour to Showpiece",
    description:
      "Classical and contemporary baking — breads, pastries, and cakes — in a fully equipped bakery lab.",
    highlights: [
      "Bread & sourdough making",
      "Pastry & viennoiserie",
      "Cake decoration techniques",
    ],
    duration: "4 Weeks",
    seats: 14,
    icon: CroissantIcon,
    tone: "gold",
    number: "02",
  },
  {
    course: "Bartending",
    slug: "bartending",
    tagline: "Craft Behind the Bar",
    description:
      "Classic cocktails to modern mixology — flair techniques, bar management, and the science of flavour.",
    highlights: [
      "Classic & craft cocktails",
      "Spirits & beverage knowledge",
      "Responsible alcohol service",
    ],
    duration: "4 Weeks",
    seats: 18,
    icon: GlassWater,
    tone: "green",
    number: "03",
  },
  // Hidden on landing for now — flip showOnLanding to true when ready
  // {
  //   course: "Sushi",
  //   slug: "sushi",
  //   ...
  // },
];

const toneStyles = {
  brown: {
    bar: "bg-(--brand-brown)",
    iconWrap:
      "border-[rgba(194,138,79,0.22)] bg-[rgba(194,138,79,0.08)] text-(--brand-brown)",
    check: "border-[rgba(194,138,79,0.25)] bg-[rgba(194,138,79,0.06)] text-(--brand-brown)",
    price: "text-(--brand-brown)",
    cta: "border-[rgba(194,138,79,0.3)] text-(--brand-brown) hover:bg-[rgba(194,138,79,0.08)]",
    panel: "bg-[rgba(194,138,79,0.06)] border-[rgba(194,138,79,0.14)]",
  },
  gold: {
    bar: "bg-[#b8956a]",
    iconWrap:
      "border-[rgba(184,149,106,0.22)] bg-[rgba(184,149,106,0.08)] text-[#b8956a]",
    check:
      "border-[rgba(184,149,106,0.25)] bg-[rgba(184,149,106,0.06)] text-[#b8956a]",
    price: "text-[#b8956a]",
    cta: "border-[rgba(184,149,106,0.3)] text-[#b8956a] hover:bg-[rgba(184,149,106,0.08)]",
    panel: "bg-[rgba(184,149,106,0.06)] border-[rgba(184,149,106,0.14)]",
  },
  green: {
    bar: "bg-(--brand-green)",
    iconWrap:
      "border-[rgba(47,78,64,0.15)] bg-[rgba(47,78,64,0.06)] text-(--brand-green)",
    check:
      "border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.05)] text-(--brand-green)",
    price: "text-(--brand-green)",
    cta: "border-[rgba(47,78,64,0.2)] text-(--brand-green) hover:bg-[rgba(47,78,64,0.05)]",
    panel: "bg-[rgba(47,78,64,0.04)] border-[rgba(47,78,64,0.12)]",
  },
};

async function fetchCourses() {
  const res = await api.get<CoursesList>("/courses");
  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to fetch courses data");
  }
  return res.data.data;
}

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className={cn(
        "program-reveal",
        visible && "program-reveal--visible",
        className,
      )}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

function ProgramMeta({
  duration,
  seats,
}: {
  duration: string;
  seats: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-1.5 font-(family-name:--font-dm-sans) text-[0.75rem] text-[rgba(47,78,64,0.55)]">
        <Clock size={13} strokeWidth={2} />
        {duration}
      </span>
      <span className="h-3 w-px bg-[rgba(47,78,64,0.12)]" />
      <span className="inline-flex items-center gap-1.5 font-(family-name:--font-dm-sans) text-[0.75rem] text-[rgba(47,78,64,0.55)]">
        <Users size={13} strokeWidth={2} />
        Max {seats} students
      </span>
    </div>
  );
}

function ProgramPrice({
  fee,
  tone,
  size = "default",
}: {
  fee?: number;
  tone: (typeof toneStyles)[ProgramTone];
  size?: "default" | "compact";
}) {
  if (fee == null) {
    return (
      <p className="font-(family-name:--font-dm-sans) text-[0.8rem] text-[rgba(47,78,64,0.45)]">
        Contact us for pricing
      </p>
    );
  }

  return (
    <div>
      <p className="mb-1 font-(family-name:--font-dm-sans) text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[rgba(47,78,64,0.4)]">
        Course fee
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="font-(family-name:--font-dm-sans) text-[0.78rem] font-medium text-[rgba(47,78,64,0.45)]">
          NPR
        </span>
        <span
          className={cn(
            "font-(family-name:--font-lora) font-bold leading-none tracking-tight",
            size === "compact" ? "text-[1.5rem]" : "text-[2rem]",
            tone.price,
          )}
        >
          {(fee / 100).toLocaleString()}
        </span>
      </div>
      <CoursePriceVatNote className="mt-1" />
    </div>
  );
}

function FeaturedProgramCard({
  program,
  fee,
}: {
  program: Program;
  fee?: number;
}) {
  const Icon = program.icon;
  const tone = toneStyles[program.tone];

  return (
    <article className="program-card group overflow-hidden border border-[rgba(47,78,64,0.1)] bg-white">
      <div
        className={cn(
          "h-1 w-full origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100",
          tone.bar,
        )}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(260px,320px)]">
        <div className="flex flex-col p-6 sm:p-8 lg:p-9">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div
              className={cn(
                "grid h-14 w-14 shrink-0 place-items-center border transition-transform duration-300 ease-out group-hover:scale-105",
                tone.iconWrap,
              )}
            >
              <Icon size={24} strokeWidth={1.75} />
            </div>
            <span className="font-(family-name:--font-dm-sans) text-[0.65rem] font-semibold tracking-[0.2em] text-[rgba(47,78,64,0.25)]">
              {program.number}
            </span>
          </div>

          <p className="mb-2 font-(family-name:--font-dm-sans) text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-(--brand-brown)">
            Featured · {program.tagline}
          </p>
          <h3 className="mb-3 font-[family-name:var(--font-playfair)] text-[clamp(1.75rem,3vw,2.25rem)] font-bold leading-tight text-(--brand-green)">
            {program.course}
          </h3>
          <p className="mb-6 max-w-2xl font-(family-name:--font-dm-sans) text-[0.92rem] leading-[1.7] text-[rgba(47,78,64,0.58)]">
            {program.description}
          </p>

          <ul className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {program.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center border",
                    tone.check,
                  )}
                >
                  <Check size={11} strokeWidth={2.5} />
                </span>
                <span className="font-(family-name:--font-dm-sans) text-[0.84rem] leading-snug text-[rgba(47,78,64,0.72)]">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto lg:hidden">
            <ProgramMeta duration={program.duration} seats={program.seats} />
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col justify-between border-t border-[rgba(47,78,64,0.08)] p-6 sm:p-8 lg:border-t-0 lg:border-l",
            tone.panel,
          )}
        >
          <div className="hidden lg:block">
            <ProgramMeta duration={program.duration} seats={program.seats} />
          </div>

          <div className="mt-6 lg:mt-10">
            <ProgramPrice fee={fee} tone={tone} />
          </div>

          <Link
            href={`/courses/${program.slug}`}
            className={cn(
              "group/btn mt-6 inline-flex w-full items-center justify-center gap-2 border px-4 py-3 font-(family-name:--font-dm-sans) text-[0.84rem] font-semibold transition-all duration-200 active:scale-[0.99]",
              tone.cta,
            )}
          >
            View Program
            <ArrowRight
              size={15}
              strokeWidth={2.5}
              className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompactProgramCard({
  program,
  fee,
}: {
  program: Program;
  fee?: number;
}) {
  const Icon = program.icon;
  const tone = toneStyles[program.tone];

  return (
    <article className="program-card group flex h-full flex-col border border-[rgba(47,78,64,0.1)] bg-white">
      <div
        className={cn(
          "h-1 w-full origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100",
          tone.bar,
        )}
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center border transition-transform duration-300 ease-out group-hover:scale-105",
              tone.iconWrap,
            )}
          >
            <Icon size={18} strokeWidth={1.75} />
          </div>
          <span className="font-(family-name:--font-dm-sans) text-[0.65rem] font-semibold tracking-[0.2em] text-[rgba(47,78,64,0.25)]">
            {program.number}
          </span>
        </div>

        <p className="mb-1 font-(family-name:--font-dm-sans) text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-(--brand-brown)">
          {program.tagline}
        </p>
        <h3 className="mb-2 font-[family-name:var(--font-playfair)] text-[1.35rem] font-bold leading-tight text-(--brand-green)">
          {program.course}
        </h3>
        <p className="mb-4 line-clamp-2 font-(family-name:--font-dm-sans) text-[0.85rem] leading-[1.6] text-[rgba(47,78,64,0.55)]">
          {program.description}
        </p>

        <ul className="mb-5 flex flex-col gap-2">
          {program.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check
                size={12}
                strokeWidth={2.5}
                className={cn("mt-0.5 shrink-0", tone.price)}
              />
              <span className="font-(family-name:--font-dm-sans) text-[0.8rem] leading-snug text-[rgba(47,78,64,0.65)]">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-[rgba(47,78,64,0.08)] pt-4">
          <div className="mb-4">
            <ProgramMeta duration={program.duration} seats={program.seats} />
          </div>

          {fee != null ? (
            <div className="mb-4">
              <ProgramPrice fee={fee} tone={tone} size="compact" />
            </div>
          ) : null}

          <Link
            href={`/courses/${program.slug}`}
            className={cn(
              "group/btn inline-flex w-full items-center justify-center gap-2 border px-4 py-2.5 font-(family-name:--font-dm-sans) text-[0.82rem] font-semibold transition-all duration-200 active:scale-[0.99]",
              tone.cta,
            )}
          >
            View Program
            <ArrowRight
              size={14}
              strokeWidth={2.5}
              className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Programs() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["landing-programs"],
    queryFn: fetchCourses,
    staleTime: 10 * 60 * 1000,
  });

  if (isPending) {
    return <ProgramsSkeleton />;
  }

  if (isError) {
    return (
      <ProgramsError
        message={
          error?.message ?? "An unexpected error occurred. Please try again."
        }
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  const courses = data;
  const visiblePrograms = programs.filter((p) => p.showOnLanding !== false);
  const featured =
    visiblePrograms.find((p) => p.featured) ?? visiblePrograms[0];
  const rest = visiblePrograms.filter((p) => p !== featured);

  const getFee = (courseName: string) =>
    courses.find((c) => c.name === courseName.toLowerCase())?.fee;

  return (
    <section
      id="programs"
      aria-labelledby="programs-heading"
      className="relative overflow-hidden bg-(--brand-cream) px-6 py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(47,78,64,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47,78,64,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "rgba(194,138,79,0.12)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-0 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "rgba(47,78,64,0.08)" }}
        aria-hidden
      />

      <div className={landingContainerClass}>
        <Reveal>
          <div className="mb-14 max-w-2xl">
            <span className={`${landingEyebrowClass} mb-4 inline-block`}>
              Our Courses
            </span>
            <h2 id="programs-heading" className={landingSectionTitleClass}>
              Courses That Build
              <br />
              <em
                className="font-medium text-(--brand-brown)"
                style={{ fontStyle: "italic" }}
              >
                Real Careers
              </em>
            </h2>
            <p className={`${landingSectionBodyClass} mt-4 max-w-xl`}>
              Practical training taught by working professionals — graduate
              job-ready, not just certified.
            </p>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <FeaturedProgramCard
            program={featured}
            fee={getFee(featured.course)}
          />
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {rest.map((program, idx) => (
            <Reveal key={program.course} delay={120 + idx * 80}>
              <CompactProgramCard
                program={program}
                fee={getFee(program.course)}
              />
            </Reveal>
          ))}
        </div>

        <Reveal delay={280}>
          <div className="program-cta mt-14 flex flex-col items-start justify-between gap-5 border border-[rgba(47,78,64,0.1)] bg-[rgba(47,78,64,0.03)] p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="mb-1 font-[family-name:var(--font-playfair)] text-[1.1rem] font-semibold text-(--brand-green)">
                Not sure which course is right for you?
              </p>
              <p className={landingSectionBodyClass}>
                Send us an inquiry and our team will guide you through the
                options.
              </p>
            </div>
            <Link
              href="#inquiry"
              className={`${landingPrimaryButtonClass} shrink-0`}
            >
              Talk to an Advisor
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </Reveal>
      </div>

      <style>{`
        .program-reveal {
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--reveal-delay, 0ms);
        }
        .program-reveal--visible {
          opacity: 1;
          transform: translateY(0);
        }
        .program-card {
          box-shadow: 0 1px 0 rgba(47, 78, 64, 0.04);
          transition:
            transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.35s ease;
        }
        .program-card:hover {
          transform: translateY(-4px);
          border-color: rgba(47, 78, 64, 0.16);
          box-shadow: 0 16px 48px rgba(47, 78, 64, 0.09);
        }
        .program-cta {
          transition: box-shadow 0.35s ease, border-color 0.35s ease;
        }
        .program-cta:hover {
          border-color: rgba(47, 78, 64, 0.16);
          box-shadow: 0 8px 32px rgba(47, 78, 64, 0.06);
        }
        @media (prefers-reduced-motion: reduce) {
          .program-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .program-card,
          .program-card:hover {
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
