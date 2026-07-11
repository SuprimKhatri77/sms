import { FileText, MessageCircle, PartyPopper, Search } from "lucide-react";
import {
  landingContainerClass,
  landingEyebrowClass,
  landingMutedSectionClass,
  landingSectionBodyClass,
  landingSectionTitleClass,
} from "./landing-styles";
import { LandingPatternCard } from "./LandingPatternCard";

const steps = [
  {
    step: "01",
    title: "Send an Inquiry",
    description:
      "Fill out our inquiry form with your details and questions. Our team will respond within 24 hours.",
    icon: MessageCircle,
    tone: "brown" as const,
  },
  {
    step: "02",
    title: "Submit Application",
    description:
      "Complete the online admission form with your details and preferred training program.",
    icon: FileText,
    tone: "green" as const,
  },
  {
    step: "03",
    title: "Admin Review",
    description:
      "Our admissions team reviews your application and confirms the next steps.",
    icon: Search,
    tone: "brown" as const,
  },
  {
    step: "04",
    title: "Welcome Aboard",
    description:
      "Once approved, receive your confirmation and begin your training journey with us.",
    icon: PartyPopper,
    tone: "green" as const,
  },
];

const toneStyles = {
  brown: {
    iconWrap: "border-[rgba(194,138,79,0.25)] bg-[rgba(194,138,79,0.1)] text-(--brand-brown)",
    step: "text-[rgba(194,138,79,0.22)]",
    bar: "from-(--brand-brown)",
  },
  green: {
    iconWrap: "border-[rgba(47,78,64,0.15)] bg-[rgba(47,78,64,0.06)] text-(--brand-green)",
    step: "text-[rgba(47,78,64,0.12)]",
    bar: "from-(--brand-green)",
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className={landingMutedSectionClass}>
      <div className={landingContainerClass}>
        <div className="mb-16 max-w-2xl">
          <span className={`${landingEyebrowClass} mb-4 inline-block`}>
            The Process
          </span>
          <h2 id="how-it-works-heading" className={landingSectionTitleClass}>
            How Enrollment
            <br />
            <em
              className="font-medium text-(--brand-brown)"
              style={{ fontStyle: "italic" }}
            >
              Works
            </em>
          </h2>
          <p className={`${landingSectionBodyClass} mt-4`}>
            We&apos;ve kept admissions straightforward and transparent — so you
            can focus on choosing the right program.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const tone = toneStyles[step.tone];
            return (
              <li key={step.step} className="relative list-none">
                {idx < steps.length - 1 ? (
                  <div
                    className="absolute top-10 -right-2.5 z-[1] hidden h-px w-5 bg-[rgba(47,78,64,0.15)] lg:block"
                    aria-hidden
                  />
                ) : null}

                <LandingPatternCard
                  tone={step.tone}
                  index={idx}
                  className="flex h-full flex-col"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div
                      className={`grid h-[52px] w-[52px] place-items-center border ${tone.iconWrap}`}
                    >
                      <Icon size={22} strokeWidth={1.75} aria-hidden />
                    </div>
                    <span
                      className={`font-[family-name:var(--font-playfair)] text-[2rem] font-extrabold leading-none ${tone.step}`}
                    >
                      {step.step}
                    </span>
                  </div>

                  <h3 className="mb-2 font-[family-name:var(--font-playfair)] text-[1.05rem] font-semibold text-(--brand-green)">
                    {step.title}
                  </h3>
                  <p className="font-(family-name:--font-dm-sans) text-[0.88rem] leading-[1.65] text-[rgba(47,78,64,0.58)]">
                    {step.description}
                  </p>

                  <div className="mt-auto pt-6">
                    <div
                      className={`h-[3px] bg-gradient-to-r ${tone.bar} to-transparent`}
                    />
                  </div>
                </LandingPatternCard>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
