import { PhoneIcon } from "@phosphor-icons/react/ssr";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { siteInfo } from "@/utils/site-info";

const HIGHLIGHTS = [
  {
    title: "4 simple steps",
    body: "Personal info, guardian, course choice, then review.",
  },
  {
    title: "About 5 minutes",
    body: "Save progress by going back anytime before you submit.",
  },
  {
    title: "We respond fast",
    body: "Our team reaches out within 24–48 hours of your application.",
  },
] as const;

export function AdmissionHero() {
  return (
    <header className="mb-12 lg:mb-16">
      <Breadcrumbs
        className="animate-rise"
        items={[{ label: "Home", href: "/" }, { label: "Admission" }]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end lg:gap-16">
        <div className="max-w-3xl">
          <p
            className="eyebrow animate-rise"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            {siteInfo.admission.cycleLabel}
          </p>
          <h1
            className="display animate-rise mt-4 text-[clamp(3rem,7vw,6rem)] text-ink"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            Apply to <em>Brew &amp; Bake.</em>
          </h1>
          <p
            className="animate-rise mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            Take the first step toward hands-on training in barista, bakery, and
            hospitality. Fill out the form below — it only takes a few minutes
            and there is no commitment until we confirm your enrollment.
          </p>
        </div>

        <aside
          className="animate-rise border border-hairline p-5 lg:p-6"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          <p className="eyebrow">Need help?</p>
          <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">
            Call or message us before you apply — we are happy to walk you
            through programs and batch schedules.
          </p>
          <a
            href={`tel:${siteInfo.contact.phone.replace(/\s/g, "")}`}
            className="group mt-4 inline-flex items-center gap-2 text-[0.875rem] text-ink outline-none"
          >
            <PhoneIcon aria-hidden weight="light" className="size-4 text-clay-deep" />
            <span className="link-underline group-hover:bg-size-[100%_1px] group-focus-visible:bg-size-[100%_1px] tabular-nums">
              {siteInfo.contact.phone}
            </span>
          </a>
        </aside>
      </div>

      <ul className="mt-12 grid grid-cols-1 border-t border-hairline sm:grid-cols-3">
        {HIGHLIGHTS.map(({ title, body }, idx) => (
          <li
            key={title}
            className="border-b border-hairline py-5 sm:border-b-0 sm:py-6 sm:pr-6 sm:not-first:border-l sm:not-first:pl-6"
          >
            <p className="font-label text-[0.6875rem] tracking-[0.16em] text-clay-deep tabular-nums">
              {String(idx + 1).padStart(2, "0")}
            </p>
            <p className="mt-3 font-display text-2xl leading-tight text-ink">
              {title}
            </p>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-muted">
              {body}
            </p>
          </li>
        ))}
      </ul>
    </header>
  );
}
