import Link from "next/link";

const stats = [
  {
    number: "1,200+",
    label: "Students Enrolled",
    colorClass: "text-[#e8552a]",
  },
  { number: "98%", label: "Parent Satisfaction", colorClass: "text-[#6b9e6b]" },
  { number: "150+", label: "Qualified Staff", colorClass: "text-[#7d6b8a]" },
  { number: "15+", label: "Years of Excellence", colorClass: "text-[#d6cbb8]" },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-32"
      style={{
        background: `
          linear-gradient(135deg, rgba(45,74,62,0.96) 0%, rgba(45,74,62,0.85) 50%, rgba(29,47,40,0.97) 100%),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `,
      }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -right-[5%] top-[15%] h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,85,42,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-[8%] bottom-[10%] h-[320px] w-[320px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(107,158,107,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ── Left: Content ── */}
        <div className="order-2 lg:order-1">
          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e8552a]/30 bg-[#e8552a]/15 px-4 py-[0.4rem]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#e8552a]" />
            <span
              className="text-[0.82rem] font-medium tracking-[0.05em] text-[#d6cbb8]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Admissions Open for 2025–26
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mb-6 text-[clamp(2.4rem,5vw,3.8rem)] font-extrabold leading-[1.12] text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Where Every Child
            <br />
            <span className="text-[#6b9e6b]">Discovers</span> Their
            <br />
            <em
              className="font-medium text-[#d6cbb8]"
              style={{ fontStyle: "italic" }}
            >
              Potential
            </em>
          </h1>

          {/* Body */}
          <p
            className="mb-10 max-w-[440px] text-[1.05rem] leading-[1.75] text-white/70"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Greenfield Academy offers a nurturing environment where curiosity is
            celebrated, character is built, and futures are shaped — from early
            years through secondary education.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admission"
              className="inline-block rounded-[10px] bg-[#e8552a] px-8 py-[0.85rem] text-[0.95rem] font-semibold tracking-[0.02em] text-white shadow-[0_4px_20px_rgba(232,85,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(232,85,42,0.45)]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Apply for Admission
            </Link>
            <a
              href="#inquiry"
              className="inline-block rounded-[10px] border border-white/25 px-8 py-[0.85rem] text-[0.95rem] font-medium text-white/85 transition-all duration-200 hover:border-[#d6cbb8] hover:text-[#d6cbb8]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Send Inquiry
            </a>
          </div>
        </div>

        {/* ── Right: Stats card ── */}
        <div className="order-1 lg:order-2">
          <div
            className="rounded-[20px] border border-white/[0.12] p-6 backdrop-blur-xl sm:p-10"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[14px] border border-white/[0.08] p-5 text-center"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <div
                    className={`mb-1 text-[2.2rem] font-bold leading-none ${stat.colorClass}`}
                    style={{ fontFamily: "var(--font-lora)" }}
                  >
                    {stat.number}
                  </div>
                  <div
                    className="text-[0.8rem] leading-[1.4] text-white/55"
                    style={{ fontFamily: "var(--font-lora)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll cue */}
          <div
            className="mt-6 flex items-center gap-3 text-[0.78rem] uppercase tracking-[0.08em] text-white/35"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <div className="h-px w-8 bg-white/25" />
            Scroll to explore
          </div>
        </div>
      </div>
    </section>
  );
}
