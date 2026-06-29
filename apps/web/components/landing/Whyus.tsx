import {
  Award,
  Briefcase,
  FlaskConical,
  HandshakeIcon,
  MapPin,
  Users,
} from "lucide-react";
import { siteInfo } from "@/utils/site-info";
import {
  landingContainerClass,
  landingCreamSectionClass,
  landingEyebrowClass,
  landingSectionBodyClass,
  landingSectionTitleClass,
} from "./landing-styles";
import { LandingPatternCard } from "./LandingPatternCard";

const features = [
  {
    icon: Award,
    title: "Industry-Ready Training",
    description:
      "Curriculum built around real café, bakery, and bar workflows — not textbook theory alone.",
    tone: "brown" as const,
  },
  {
    icon: Briefcase,
    title: "Career-Focused Skills",
    description:
      "Graduate with practical competencies employers look for, from technique to professional conduct.",
    tone: "green" as const,
  },
  {
    icon: HandshakeIcon,
    title: "Mentorship & Support",
    description:
      "Learn from working professionals who guide you through every stage of your training.",
    tone: "brown" as const,
  },
  {
    icon: FlaskConical,
    title: "Hands-On Labs",
    description:
      "Train in fully equipped spaces designed to mirror professional kitchen and bar environments.",
    tone: "green" as const,
  },
  {
    icon: Users,
    title: "Small Class Sizes",
    description:
      "Focused cohorts mean more practice time, direct feedback, and personalised attention.",
    tone: "brown" as const,
  },
  {
    icon: MapPin,
    title: "Clear Admissions Path",
    description:
      "A straightforward inquiry-to-enrollment process with transparent communication at every step.",
    tone: "green" as const,
  },
];

const toneStyles = {
  brown: {
    iconWrap: "border-[rgba(194,138,79,0.25)] bg-[rgba(194,138,79,0.1)] text-(--brand-brown)",
    bar: "bg-(--brand-brown)",
  },
  green: {
    iconWrap: "border-[rgba(47,78,64,0.15)] bg-[rgba(47,78,64,0.06)] text-(--brand-green)",
    bar: "bg-(--brand-green)",
  },
};

export default function WhyUs() {
  return (
    <section id="why-us" className={landingCreamSectionClass}>
      <div className={landingContainerClass}>
        <div className="mb-16 max-w-2xl">
          <span className={`${landingEyebrowClass} mb-4 inline-block`}>
            Why Choose Us
          </span>
          <h2 className={landingSectionTitleClass}>
            Training That Builds
            <br />
            <em
              className="font-medium text-(--brand-brown)"
              style={{ fontStyle: "italic" }}
            >
              Real Skills
            </em>
          </h2>
          <p className={`${landingSectionBodyClass} mt-4 max-w-xl`}>
            At {siteInfo.company.shortName}, we don&apos;t just run classes — we
            prepare you for careers in hospitality with practical, professional
            training.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const tone = toneStyles[feature.tone];
            return (
              <LandingPatternCard
                key={feature.title}
                tone={feature.tone}
                index={index}
              >
                <div
                  className={`mb-5 grid h-11 w-11 place-items-center border ${tone.iconWrap}`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 font-[family-name:var(--font-playfair)] text-[1.1rem] font-semibold text-(--brand-green)">
                  {feature.title}
                </h3>
                <p className="font-[family-name:var(--font-dm-sans)] text-[0.9rem] leading-[1.65] text-[rgba(47,78,64,0.58)]">
                  {feature.description}
                </p>
                <div className={`mt-5 h-[2px] w-8 ${tone.bar}`} />
              </LandingPatternCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
