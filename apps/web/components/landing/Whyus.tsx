import {
  ChalkboardTeacherIcon,
  FlaskIcon,
  MedalIcon,
  RoadHorizonIcon,
  SuitcaseSimpleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/ssr";
import { siteInfo } from "@/utils/site-info";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";

const features = [
  {
    icon: MedalIcon,
    title: "Industry-ready training",
    description:
      "Curriculum built around real café, bakery, and bar workflows — not textbook theory alone.",
  },
  {
    icon: SuitcaseSimpleIcon,
    title: "Career-focused skills",
    description:
      "Graduate with practical competencies employers look for, from technique to professional conduct.",
  },
  {
    icon: ChalkboardTeacherIcon,
    title: "Mentorship & support",
    description:
      "Learn from working professionals who guide you through every stage of your training.",
  },
  {
    icon: FlaskIcon,
    title: "Hands-on labs",
    description:
      "Train in fully equipped spaces designed to mirror professional kitchen and bar environments.",
  },
  {
    icon: UsersThreeIcon,
    title: "Small class sizes",
    description:
      "Focused cohorts mean more practice time, direct feedback, and personalised attention.",
  },
  {
    icon: RoadHorizonIcon,
    title: "Clear admissions path",
    description:
      "A straightforward inquiry-to-enrollment process with transparent communication at every step.",
  },
];

export default function WhyUs() {
  return (
    <section
      id="why-us"
      aria-labelledby="why-us-heading"
      className="border-y border-hairline bg-surface py-20 font-site sm:py-28"
    >
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="why-us-heading"
            eyebrow="Why choose us"
            title={
              <>
                Training that builds <em>real skills.</em>
              </>
            }
            description={`At ${siteInfo.company.shortName}, we don't just run classes — we prepare you for a career in hospitality with practical, professional training.`}
          />
        </Reveal>

        <Stagger className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, i) => (
            <StaggerItem
              key={title}
              className="group flex flex-col gap-10 bg-surface p-6 transition-colors duration-500 hover:bg-paper sm:p-8 lg:min-h-72"
            >
              <div className="flex items-start justify-between">
                <Icon
                  aria-hidden
                  weight="light"
                  className="size-8 text-clay transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5"
                />
                <span className="font-label text-[0.6875rem] tracking-[0.16em] text-ink-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-auto space-y-2">
                <h3 className="font-display text-3xl leading-tight text-ink">
                  {title}
                </h3>
                <p className="max-w-sm text-[0.875rem] leading-relaxed text-ink-muted">
                  {description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
