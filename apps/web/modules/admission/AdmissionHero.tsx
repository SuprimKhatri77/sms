import { Clock, FileCheck, GraduationCap, Phone } from "lucide-react";
import {
  landingSectionBodyClass,
  landingSectionTitleClass,
} from "@/components/landing/landing-styles";
import { siteInfo } from "@/utils/site-info";
import { admissionEyebrowClass } from "./admission-styles";

const HIGHLIGHTS = [
  {
    icon: FileCheck,
    title: "4 simple steps",
    body: "Personal info, guardian, course choice, then review.",
  },
  {
    icon: Clock,
    title: "About 5 minutes",
    body: "Save progress by going back anytime before you submit.",
  },
  {
    icon: GraduationCap,
    title: "We respond fast",
    body: "Our team reaches out within 24–48 hours of your application.",
  },
] as const;

export function AdmissionHero() {
  return (
    <header className="mb-10 lg:mb-14">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end lg:gap-12">
        <div className="max-w-2xl">
          <span className={`${admissionEyebrowClass} mb-4 inline-block`}>
            {siteInfo.admission.cycleLabel}
          </span>
          <h1 className={landingSectionTitleClass}>
            Apply to{" "}
            <em
              className="font-medium text-(--brand-brown)"
              style={{ fontStyle: "italic" }}
            >
              {siteInfo.company.shortName}
            </em>
          </h1>
          <p className={`${landingSectionBodyClass} mt-4 max-w-xl`}>
            Take the first step toward hands-on training in barista, bakery, and
            hospitality. Fill out the form below — it only takes a few minutes
            and there is no commitment until we confirm your enrollment.
          </p>
        </div>

        <aside className="border border-[rgba(47,78,64,0.1)] bg-white p-5 lg:p-6">
          <p className="font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[rgba(47,78,64,0.42)]">
            Need help?
          </p>
          <p className="mt-2 font-[family-name:var(--font-dm-sans)] text-[0.88rem] leading-relaxed text-[rgba(47,78,64,0.62)]">
            Call or message us before you apply — we are happy to walk you
            through programs and batch schedules.
          </p>
          <a
            href={`tel:${siteInfo.contact.phone.replace(/\s/g, "")}`}
            className="mt-4 inline-flex items-center gap-2 font-[family-name:var(--font-dm-sans)] text-[0.88rem] font-semibold text-(--brand-brown) transition-colors hover:text-(--brand-green)"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            {siteInfo.contact.phone}
          </a>
        </aside>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex gap-3.5 border border-[rgba(47,78,64,0.1)] bg-white p-4 sm:p-5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[rgba(194,138,79,0.1)] text-(--brand-brown)">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-[family-name:var(--font-dm-sans)] text-[0.88rem] font-semibold text-(--brand-green)">
                {title}
              </p>
              <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[0.8rem] leading-relaxed text-[rgba(47,78,64,0.52)]">
                {body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </header>
  );
}
