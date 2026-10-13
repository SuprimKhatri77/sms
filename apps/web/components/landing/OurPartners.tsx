import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";

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
      id="partners"
      aria-labelledby="partners-heading"
      className="container-page py-20 font-site sm:py-28"
    >
      <Reveal>
        <SectionHeading
          id="partners-heading"
          eyebrow="Industry network"
          title={
            <>
              Trusted by the <em>industry&apos;s best.</em>
            </>
          }
          description="Our graduates are sought after by leading hotels, restaurants, and culinary institutions across Nepal and beyond."
        />
      </Reveal>

      <Reveal>
        <dl className="mb-14 grid grid-cols-3 border-y border-hairline">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse gap-2 border-hairline py-6 not-first:border-l not-first:pl-4 sm:not-first:pl-8"
            >
              <dt className="eyebrow">{stat.label}</dt>
              <dd className="font-display text-4xl leading-none text-ink sm:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-4">
        {partners.map((partner) => (
          <StaggerItem
            key={partner.name}
            className="group flex min-h-40 flex-col justify-between gap-6 bg-paper p-5 transition-colors duration-500 hover:bg-surface sm:p-6"
          >
            <p className="eyebrow">{partner.category}</p>
            <div>
              <p className="font-display text-2xl leading-tight text-ink">
                {partner.name}
              </p>
              <p className="mt-1 text-[0.75rem] text-ink-muted">
                {partner.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.9375rem] text-ink-muted">
          Are you a hospitality business looking to hire trained graduates?
        </p>
        <Link
          href="#inquiry"
          className="group inline-flex items-center gap-2 text-[0.8125rem] text-ink outline-none"
        >
          <span className="link-underline">Become a partner</span>
          <ArrowRightIcon
            aria-hidden
            className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
          />
        </Link>
      </Reveal>
    </section>
  );
}
