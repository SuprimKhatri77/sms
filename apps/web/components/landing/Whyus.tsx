import {
  GraduationCap,
  Sprout,
  HandshakeIcon,
  FlaskConical,
  Users,
  ClipboardList,
} from "lucide-react";
import { siteInfo } from "@/utils/site-info";

const features = [
  {
    icon: GraduationCap,
    title: "Academic Excellence",
    description:
      "Our rigorous curriculum is designed by experienced educators to nurture critical thinking and a lifelong love of learning.",
    accent: "var(--brand-orange)",
    bgClass: "bg-[#e8552a]/10",
    iconClass: "text-[#e8552a]",
    barClass: "bg-[#e8552a]",
  },
  {
    icon: Sprout,
    title: "Holistic Development",
    description:
      "Beyond academics — sports, arts, leadership, and community service shape well-rounded individuals ready for life.",
    accent: "var(--brand-sage)",
    bgClass: "bg-[#6b9e6b]/10",
    iconClass: "text-[#6b9e6b]",
    barClass: "bg-[#6b9e6b]",
  },
  {
    icon: HandshakeIcon,
    title: "Supportive Community",
    description:
      "A warm, inclusive environment where every student is known by name, celebrated for their unique strengths.",
    accent: "var(--brand-mauve)",
    bgClass: "bg-[#7d6b8a]/10",
    iconClass: "text-[#7d6b8a]",
    barClass: "bg-[#7d6b8a]",
  },
  {
    icon: FlaskConical,
    title: "Modern Facilities",
    description:
      "State-of-the-art labs, libraries, and digital classrooms that make learning immersive and forward-thinking.",
    accent: "var(--brand-green)",
    bgClass: "bg-[#2d4a3e]/10",
    iconClass: "text-[#2d4a3e]",
    barClass: "bg-[#2d4a3e]",
  },
  {
    icon: Users,
    title: "Parent Partnership",
    description:
      "We believe in transparent, consistent communication — parents are valued partners in every child's education.",
    accent: "var(--brand-orange)",
    bgClass: "bg-[#e8552a]/10",
    iconClass: "text-[#e8552a]",
    barClass: "bg-[#e8552a]",
  },
  {
    icon: ClipboardList,
    title: "Transparent Admissions",
    description:
      "Simple, fair, and clear admission process. Submit your application online and track your status — no hidden steps.",
    accent: "var(--brand-sage)",
    bgClass: "bg-[#6b9e6b]/10",
    iconClass: "text-[#6b9e6b]",
    barClass: "bg-[#6b9e6b]",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-[#faf9f7] px-6 py-24">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-16 text-center">
          <span
            className="mb-3 inline-block text-[0.78rem] font-semibold tracking-widest text-[#e8552a] uppercase"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Why Choose Us
          </span>
          <h2
            className="mb-4 text-[clamp(2rem,4vw,2.8rem)] font-bold leading-[1.2] text-[#2d4a3e]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            An Education That Goes
            <br />
            <em
              className="font-medium text-[#7d6b8a]"
              style={{
                fontStyle: "italic",
                fontFamily: "var(--font-playfair)",
              }}
            >
              Beyond the Classroom
            </em>
          </h2>
          <p
            className="mx-auto max-w-[520px] text-base leading-[1.7] text-[#666]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            At {siteInfo.company.shortName}, we don&apos;t just run classes - we
            build practical skills, confidence, and career-ready professionals.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group cursor-default rounded-2xl border border-black/6 bg-white p-8 transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
              >
                {/* Icon */}
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgClass}`}
                >
                  <Icon
                    className={`h-5 w-5 ${feature.iconClass}`}
                    strokeWidth={1.75}
                  />
                </div>

                {/* Title */}
                <h3
                  className="mb-[0.65rem] text-[1.15rem] font-semibold text-[#2d4a3e]"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="text-[0.9rem] leading-[1.65] text-[#777]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {feature.description}
                </p>

                {/* Accent bar */}
                <div
                  className={`mt-5 h-[2px] w-8 rounded-sm ${feature.barClass}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
