import Link from "next/link";
import {
  Coffee,
  CroissantIcon,
  GlassWater,
  UtensilsCrossed,
  CheckCircle2,
  ArrowRight,
  MoveRight,
} from "lucide-react";

const programs = [
  {
    course: "Barista",
    slug: "barista",
    tagline: "The Art of Coffee",
    description:
      "Master espresso extraction, milk texturing, latte art, and cafe workflow. From bean origin to the perfect cup — passion turned into craft.",
    highlights: [
      "Espresso theory & extraction",
      "Milk steaming & latte art",
      "Cafe equipment handling",
      "Customer service & menu design",
    ],
    duration: "8 Weeks",
    seats: 16,
    icon: Coffee,
    color: "#E8552A",
    bgClass: "bg-[#E8552A]/15",
    borderClass: "border-[#E8552A]/35",
    textClass: "text-[#E8552A]",
    iconBg: "bg-[#E8552A]/10",
    accentBar: "bg-[#E8552A]",
    hoverGlow: "hover:shadow-[0_8px_32px_rgba(232,85,42,0.18)]",
  },
  {
    course: "Bakery",
    slug: "bakery",
    tagline: "From Flour to Showpiece",
    description:
      "Classical and contemporary baking — breads, pastries, cakes — with hands-on sessions in a fully equipped bakery lab.",
    highlights: [
      "Bread & sourdough making",
      "Pastry & viennoiserie",
      "Cake decoration techniques",
      "Food costing & production",
    ],
    duration: "10 Weeks",
    seats: 14,
    icon: CroissantIcon,
    color: "#D4A55A",
    bgClass: "bg-[#D4A55A]/15",
    borderClass: "border-[#D4A55A]/35",
    textClass: "text-[#D4A55A]",
    iconBg: "bg-[#D4A55A]/10",
    accentBar: "bg-[#D4A55A]",
    hoverGlow: "hover:shadow-[0_8px_32px_rgba(212,165,90,0.18)]",
  },
  {
    course: "Bartending",
    slug: "bartending",
    tagline: "Craft Behind the Bar",
    description:
      "Classic cocktails to modern mixology — flair techniques, bar management, and the science of flavour pairing.",
    highlights: [
      "Classic & craft cocktails",
      "Spirits & beverage knowledge",
      "Bar operations & hygiene",
      "Responsible alcohol service",
    ],
    duration: "6 Weeks",
    seats: 18,
    icon: GlassWater,
    color: "#9B7FC7",
    bgClass: "bg-[#9B7FC7]/15",
    borderClass: "border-[#9B7FC7]/35",
    textClass: "text-[#9B7FC7]",
    iconBg: "bg-[#9B7FC7]/10",
    accentBar: "bg-[#9B7FC7]",
    hoverGlow: "hover:shadow-[0_8px_32px_rgba(155,127,199,0.18)]",
  },
  {
    course: "Sushi",
    slug: "sushi",
    tagline: "Japanese Culinary Tradition",
    description:
      "Precision and philosophy behind Japanese cuisine — rice prep, fish butchery, nigiri, maki, and omakase plating standards.",
    highlights: [
      "Sushi rice & seasoning",
      "Fish filleting & food safety",
      "Nigiri, maki & temaki",
      "Plating & omakase culture",
    ],
    duration: "10 Weeks",
    seats: 12,
    icon: UtensilsCrossed,
    color: "#4EA87A",
    bgClass: "bg-[#4EA87A]/15",
    borderClass: "border-[#4EA87A]/35",
    textClass: "text-[#4EA87A]",
    iconBg: "bg-[#4EA87A]/10",
    accentBar: "bg-[#4EA87A]",
    hoverGlow: "hover:shadow-[0_8px_32px_rgba(78,168,122,0.18)]",
  },
] as const;

export default function Programs() {
  return (
    <section
      id="programs"
      className="relative w-full overflow-hidden bg-[#2d4a3e] px-6 py-24"
    >
      {/* Dot texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.025' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-96 w-96"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(232,85,42,0.1) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* ── Header ── */}
        <div className="mb-16 text-center">
          <span
            className="mb-3 inline-block text-[0.78rem] font-semibold uppercase tracking-widest text-[#6b9e6b]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Our Courses
          </span>
          <h2
            className="mb-4 text-[clamp(2rem,4vw,2.8rem)] font-bold leading-[1.2] text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Courses That Build
            <br />
            <em
              className="font-medium text-[#d6cbb8]"
              style={{ fontStyle: "italic" }}
            >
              Real Careers
            </em>
          </h2>
          <p
            className="mx-auto max-w-xl text-base leading-[1.7] text-white/60"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Practical, industry-aligned training taught by working professionals
            — so you graduate job-ready, not just certified.
          </p>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <div
                key={program.course}
                className={`group flex flex-col rounded-2xl border border-white/10 bg-white/6 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:-translate-y-1 ${program.hoverGlow}`}
              >
                {/* Icon + tagline row */}
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${program.iconBg}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${program.textClass}`}
                      strokeWidth={1.75}
                    />
                  </div>
                  <span
                    className={`inline-block rounded-full border px-3 py-1 text-[0.72rem] font-semibold tracking-[0.04em] ${program.bgClass} ${program.borderClass} ${program.textClass}`}
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {program.tagline}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="mb-1 text-[1.45rem] font-bold leading-[1.2] text-white"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {program.course}
                </h3>

                {/* Duration + seats meta */}
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="text-[0.75rem] font-medium"
                    style={{ color: program.color }}
                  >
                    {program.duration}
                  </span>
                  <span className="h-3 w-px bg-white/15" />
                  <span className="text-[0.75rem] text-white/35">
                    Max {program.seats} students
                  </span>
                </div>

                {/* Description */}
                <p
                  className="mb-5 flex-1 text-[0.88rem] leading-[1.65] text-white/55"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {program.description}
                </p>

                {/* Divider */}
                <div className="mb-5 h-px bg-white/8" />

                {/* Highlights */}
                <ul className="mb-6 flex flex-col gap-2.5">
                  {program.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-[0.83rem] text-white/60"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 shrink-0 ${program.textClass}`}
                        strokeWidth={2}
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* ── Course detail link ── */}
                <Link
                  href={`/courses/${program.slug}`}
                  className="group/link mt-auto flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[0.82rem] font-semibold text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  <span>View Full Program</span>
                  <MoveRight
                    className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1"
                    strokeWidth={2}
                  />
                </Link>

                {/* Bottom accent bar */}
                <div
                  className={`mt-4 h-0.75 w-10 rounded-full ${program.accentBar} transition-all duration-300 group-hover:w-full`}
                />
              </div>
            );
          })}
        </div>

        {/* ── CTA strip ── */}
        <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p
              className="mb-1 text-[1.1rem] font-semibold text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Not sure which course is right for you?
            </p>
            <p
              className="text-[0.9rem] text-white/50"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Send us an inquiry and our team will guide you through the
              options.
            </p>
          </div>
          <Link
            href="#inquiry"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#e8552a] px-6 py-3 text-[0.875rem] font-semibold text-white shadow-[0_4px_16px_rgba(232,85,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(232,85,42,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Talk to an Advisor
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
