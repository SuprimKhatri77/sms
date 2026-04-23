import { MessageCircle, FileText, Search, PartyPopper } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Send an Inquiry",
    description:
      "Fill out our simple inquiry form with your basic details and questions. Our team will get in touch within 24 hours.",
    icon: MessageCircle,
    colorVar: "var(--brand-orange)",
    bgClass: "bg-[#e8552a]/10",
    textClass: "text-[#e8552a]",
    stepClass: "text-[#e8552a]/20",
  },
  {
    step: "02",
    title: "Submit Application",
    description:
      "Complete the online admission form with your child's details, academic background, and preferred program.",
    icon: FileText,
    colorVar: "var(--brand-sage)",
    bgClass: "bg-[#6b9e6b]/10",
    textClass: "text-[#6b9e6b]",
    stepClass: "text-[#6b9e6b]/20",
  },
  {
    step: "03",
    title: "Admin Review",
    description:
      "Our admin team carefully reviews your application. You'll be notified of any additional requirements or updates.",
    icon: Search,
    colorVar: "var(--brand-mauve)",
    bgClass: "bg-[#7d6b8a]/10",
    textClass: "text-[#7d6b8a]",
    stepClass: "text-[#7d6b8a]/20",
  },
  {
    step: "04",
    title: "Welcome Aboard",
    description:
      "Once verified, receive your confirmation and welcome pack. Your child's journey at Greenfield begins!",
    icon: PartyPopper,
    colorVar: "var(--brand-green)",
    bgClass: "bg-[#2d4a3e]/10",
    textClass: "text-[#2d4a3e]",
    stepClass: "text-[#2d4a3e]/20",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#f4f1ec] px-6 py-24"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-[4.5rem] text-center">
          <span
            className="mb-3 inline-block text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[#e8552a]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            The Process
          </span>
          <h2
            className="mb-4 text-[clamp(2rem,4vw,2.8rem)] font-bold leading-[1.2] text-[#2d4a3e]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            How Enrollment
            <br />
            <em
              className="font-medium not-italic text-[#7d6b8a]"
              style={{
                fontStyle: "italic",
                fontFamily: "var(--font-playfair)",
              }}
            >
              Works
            </em>
          </h2>
          <p
            className="mx-auto max-w-[480px] text-base leading-[1.7] text-[#666]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            We&apos;ve made the admission process straightforward and
            transparent — so you can focus on what matters.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative">
                {/* Connector line — desktop only */}
                {idx < steps.length - 1 && (
                  <div
                    className="connector-line absolute right-[-1rem] top-8 z-[1] hidden h-[2px] w-8 lg:block"
                    style={{
                      background: `linear-gradient(to right, ${step.colorVar}60, transparent)`,
                    }}
                  />
                )}

                <div className="group flex h-full flex-col rounded-[18px] border border-black/[0.06] bg-white p-8 transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                  {/* Icon row */}
                  <div className="mb-6 flex items-center justify-between">
                    <div
                      className={`flex h-[52px] w-[52px] items-center justify-center rounded-[14px] ${step.bgClass}`}
                    >
                      <Icon
                        className={`h-6 w-6 ${step.textClass}`}
                        strokeWidth={1.75}
                      />
                    </div>
                    <span
                      className={`leading-none ${step.stepClass}`}
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "2rem",
                        fontWeight: 800,
                      }}
                    >
                      {step.step}
                    </span>
                  </div>

                  {/* Text */}
                  <h3
                    className="mb-[0.65rem] text-[1.15rem] font-semibold text-[#2d4a3e]"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-[0.88rem] leading-[1.65] text-[#777]"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {step.description}
                  </p>

                  {/* Bottom accent bar — inline only for the dynamic gradient */}
                  <div className="mt-auto pt-6">
                    <div
                      className="h-[3px] rounded-sm"
                      style={{
                        background: `linear-gradient(to right, ${step.colorVar}, transparent)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
