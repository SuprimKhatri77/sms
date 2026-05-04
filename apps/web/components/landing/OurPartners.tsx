import Link from "next/link";

const partners = [
  {
    name: "Hyatt Hotels",
    category: "Hospitality",
    description: "Preferred placement partner",
    logo: null,
  },
  {
    name: "Marriott International",
    category: "Hospitality",
    description: "Graduate recruitment partner",
    logo: null,
  },
  {
    name: "World Coffee Alliance",
    category: "Certification",
    description: "SCA exam pathway provider",
    logo: null,
  },
  {
    name: "Le Cordon Bleu",
    category: "Education",
    description: "Academic exchange program",
    logo: null,
  },
  {
    name: "Nepal Tourism Board",
    category: "Government",
    description: "Industry development partner",
    logo: null,
  },
  {
    name: "Dwarika's Group",
    category: "Hospitality",
    description: "Internship placement host",
    logo: null,
  },
  {
    name: "Japan Sushi Institute",
    category: "Certification",
    description: "Sushi skills certification body",
    logo: null,
  },
  {
    name: "Diageo World Class",
    category: "Beverages",
    description: "Bartending excellence partner",
    logo: null,
  },
] as const;

const stats = [
  { value: "22+", label: "Industry Partners" },
  { value: "93%", label: "Placement Rate" },
  { value: "3 wks", label: "Avg. Time to Hire" },
] as const;

export default function OurPartners() {
  return (
    <section
      className="relative w-full overflow-hidden px-6 py-24"
      style={{ backgroundColor: "var(--brand-cream, #fbfaf7)" }}
    >
      {/* Subtle grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* ── Header ── */}
        <div className="mb-16 flex flex-col items-center text-center">
          <span
            className="mb-3 inline-block text-[0.75rem] font-semibold uppercase tracking-[0.2em]"
            style={{
              color: "var(--brand-green, #2f4e40)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Industry Network
          </span>
          <h2
            className="mb-4 text-[clamp(1.9rem,3.5vw,2.6rem)] font-bold leading-[1.15]"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--brand-ink, #1a1a1a)",
            }}
          >
            Trusted by the{" "}
            <em
              className="font-normal italic"
              style={{ color: "var(--brand-brown, #c28a4f)" }}
            >
              Industry&apos;s Best
            </em>
          </h2>
          <p
            className="max-w-lg text-[0.95rem] leading-[1.75]"
            style={{
              color: "rgba(26,26,26,0.55)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Our graduates are sought after by leading hotels, restaurants, and
            culinary institutions across Nepal and beyond.
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="mb-14 flex flex-wrap items-center justify-center gap-12">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-12">
              <div className="text-center">
                <p
                  className="text-[2.2rem] font-bold leading-none tracking-tight"
                  style={{
                    fontFamily: "var(--font-lora)",
                    color: "var(--brand-green, #2f4e40)",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="mt-1 text-[0.75rem] uppercase tracking-widest"
                  style={{
                    color: "rgba(26,26,26,0.4)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {stat.label}
                </p>
              </div>
              {/* Divider — hide after last item */}
              {i < stats.length - 1 && (
                <div
                  className="hidden h-10 w-px sm:block"
                  style={{ backgroundColor: "rgba(47,78,64,0.15)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Full-bleed horizontal rule with label ── */}
        <div className="relative mb-12 flex items-center gap-4">
          <div
            className="h-px flex-1"
            style={{ backgroundColor: "rgba(47,78,64,0.12)" }}
          />
          <span
            className="shrink-0 text-[0.72rem] uppercase tracking-[0.18em]"
            style={{
              color: "rgba(26,26,26,0.35)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Our Partners
          </span>
          <div
            className="h-px flex-1"
            style={{ backgroundColor: "rgba(47,78,64,0.12)" }}
          />
        </div>

        {/* ── Partner grid ── */}
        <div
          className="grid grid-cols-2 overflow-hidden rounded-2xl border sm:grid-cols-4"
          style={{ borderColor: "rgba(47,78,64,0.14)" }}
        >
          {partners.map((partner, i) => {
            const tinted = i === 0 || i === 3 || i === 5 || i === 6;

            const isLastInRow = (i + 1) % 4 === 0;
            const isLastRow = i >= partners.length - 4;

            return (
              <div
                key={partner.name}
                className="group relative flex flex-col items-center justify-center px-6 py-9 transition-colors duration-200"
                style={{
                  backgroundColor: tinted
                    ? "rgba(47,78,64,0.05)"
                    : "var(--brand-cream, #fbfaf7)",
                  borderRight: !isLastInRow
                    ? "1px solid rgba(47,78,64,0.12)"
                    : undefined,
                  borderBottom: !isLastRow
                    ? "1px solid rgba(47,78,64,0.12)"
                    : undefined,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ backgroundColor: "rgba(47,78,64,0.04)" }}
                />

                <div className="relative mb-3 flex h-10 items-center justify-center">
                  <LogoPlaceholder name={partner.name} />
                </div>

                <span
                  className="rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-widest"
                  style={{
                    backgroundColor: "rgba(194,138,79,0.12)",
                    color: "var(--brand-brown, #c28a4f)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {partner.category}
                </span>

                <p
                  className="mt-2 max-w-35 text-center text-[0.75rem] leading-normal opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    color: "rgba(26,26,26,0.45)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {partner.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-14 flex flex-col items-center gap-4 text-center">
          <p
            className="text-[0.9rem]"
            style={{
              color: "rgba(26,26,26,0.5)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Are you a hospitality business looking to hire trained graduates?
          </p>
          <Link
            href="#inquiry"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-[0.875rem] font-semibold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline"
            style={{
              borderColor: "rgba(47,78,64,0.3)",
              color: "var(--brand-green, #2f4e40)",
              backgroundColor: "transparent",
              fontFamily: "var(--font-dm-sans)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "rgba(47,78,64,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "transparent";
            }}
          >
            Become a Partner
          </Link>
        </div>
      </div>
    </section>
  );
}

function LogoPlaceholder({ name }: { name: string }) {
  return (
    <span
      className="text-[0.85rem] font-semibold tracking-tight"
      style={{
        fontFamily: "var(--font-playfair)",
        color: "var(--brand-ink, #1a1a1a)",
      }}
    >
      {name}
    </span>
  );
}
