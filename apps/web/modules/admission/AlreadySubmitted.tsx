import Link from "next/link";
import { ButtonArrow, siteButton } from "@/components/site/button";
import { cn } from "@/lib/utils";
import { siteInfo } from "@/utils/site-info";

// ─── Types ────────────────────────────────────────────────────────────────────

type StudentStatus = "active" | "pending" | "rejected" | "completed";

interface AlreadySubmittedProps {
  studentName: string;
  submittedAt: string;
  status: StudentStatus;
}

interface StatusConfig {
  eyebrow: string;
  dotColor: string;
  headline: (firstName: string) => React.ReactNode;
  subCopy: string;
}

interface StepItem {
  label: string;
  description: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    // Pinned so the server and every visitor see the academy's date.
    timeZone: "Asia/Kathmandu",
  });
}

const rise = (i: number) => ({ "--i": i }) as React.CSSProperties;

// ─── Status config map ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<StudentStatus, StatusConfig> = {
  pending: {
    eyebrow: "Application Pending",
    dotColor: "bg-clay",
    headline: (firstName) => (
      <>
        Hang tight, <em>{firstName}.</em>
      </>
    ),
    subCopy:
      "Your application is in our hands and under careful review. We appreciate your patience — good things take a little time.",
  },
  active: {
    eyebrow: "Application Received",
    dotColor: "bg-pine",
    headline: (firstName) => (
      <>
        You&apos;re all set, <em>{firstName}.</em>
      </>
    ),
    subCopy:
      "Your admission form has already been submitted. There's nothing more you need to do right now — sit tight!",
  },
  completed: {
    eyebrow: "Program Completed",
    dotColor: "bg-pine",
    headline: (firstName) => (
      <>
        Congratulations, <em>{firstName}.</em>
      </>
    ),
    subCopy:
      "You've successfully completed your program with Brew & Bake Academy. It's been a pleasure having you with us.",
  },
  rejected: {
    eyebrow: "Application Unsuccessful",
    dotColor: "bg-ink-muted",
    headline: (firstName) => (
      <>
        We&apos;re sorry, <em>{firstName}.</em>
      </>
    ),
    subCopy:
      "After careful consideration, we were unable to offer you a place this cycle. This is never an easy decision, and we genuinely appreciate your interest.",
  },
};

// ─── Steps per status ─────────────────────────────────────────────────────────

const STATUS_STEPS: Record<StudentStatus, StepItem[]> = {
  pending: [
    {
      label: "Application Under Review",
      description:
        "Our admissions team carefully reviews every application. This typically takes 2–3 business days.",
    },
    {
      label: "You'll Hear From Us",
      description:
        "We'll reach out via your registered email or phone with your admission decision.",
    },
    {
      label: "Orientation & Onboarding",
      description:
        "Once confirmed, you'll receive batch schedule, orientation date, and all materials.",
    },
  ],
  active: [
    {
      label: "Application Under Review",
      description:
        "Our admissions team carefully reviews every application. This typically takes 2–3 business days.",
    },
    {
      label: "You'll Hear From Us",
      description:
        "We'll reach out via your registered email or phone with your admission status.",
    },
    {
      label: "Orientation & Onboarding",
      description:
        "Once confirmed, you'll receive details about your batch schedule, orientation date, and materials.",
    },
  ],
  completed: [
    {
      label: "Certificate Issued",
      description:
        "Your certificate of completion has been issued. Contact us if you need an extra copy.",
    },
    {
      label: "Alumni Network",
      description:
        "You're now part of our growing alumni family. Stay connected and keep brewing.",
    },
    {
      label: "Career Support",
      description:
        "Our placement support team is still available to you as an alumnus.",
    },
  ],
  rejected: [
    {
      label: "Reapply Next Cycle",
      description:
        "Admissions open every cycle. We encourage you to apply again — many of our best students were re-applicants.",
    },
    {
      label: "Contact Admissions",
      description:
        "Reach out to understand the decision better or ask what you can strengthen before reapplying.",
    },
    {
      label: "Explore Short Programs",
      description:
        "Browse our workshops and short courses — there may be a shorter path in for you.",
    },
  ],
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AlreadySubmitted({
  studentName,
  submittedAt,
  status,
}: AlreadySubmittedProps) {
  const firstName = studentName.split(" ")[0] ?? "Student";
  const formattedDate = formatDate(submittedAt);
  const config = STATUS_CONFIG[status];
  const steps = STATUS_STEPS[status];

  const showDashboardCTA = status === "active" || status === "completed";
  const tel = siteInfo.contact.phone.replace(/\s/g, "");

  return (
    <main className="bg-paper pt-12 pb-20 font-site sm:pt-16 sm:pb-28">
      <div className="container-page grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <p className="eyebrow animate-rise flex items-center gap-3">
            <span className="relative flex size-2 shrink-0" aria-hidden>
              {status === "pending" ? (
                <span
                  className={cn(
                    "absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none",
                    config.dotColor,
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "relative inline-flex size-2 rounded-full",
                  config.dotColor,
                )}
              />
            </span>
            {config.eyebrow}
          </p>

          <h1
            className="display animate-rise mt-6 text-[clamp(3rem,7vw,5.5rem)] text-ink"
            style={rise(1)}
          >
            {config.headline(firstName)}
          </h1>

          <p
            className="animate-rise mt-6 max-w-md text-[1rem] leading-relaxed text-ink-muted"
            style={rise(2)}
          >
            {config.subCopy}
          </p>

          <dl
            className="animate-rise mt-10 grid max-w-md grid-cols-[7rem_1fr] items-baseline gap-4 border-y border-hairline py-4"
            style={rise(3)}
          >
            <dt className="eyebrow">Submitted</dt>
            <dd className="text-[0.9375rem] text-ink">{formattedDate}</dd>
          </dl>

          <div
            className="animate-rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-5"
            style={rise(4)}
          >
            {showDashboardCTA && (
              <Link
                href="/dashboard"
                className={siteButton({ variant: "pine", size: "lg" })}
              >
                Go to dashboard
                <ButtonArrow />
              </Link>
            )}
            <Link
              href="/"
              className="link-underline text-[0.875rem] text-ink outline-none"
            >
              Back to home
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <p className="eyebrow animate-rise" style={rise(2)}>
            {status === "rejected" ? "Your options" : "What happens next"}
          </p>
          <ol className="mt-6 border-t border-hairline">
            {steps.map((step, i) => (
              <li
                key={step.label}
                className="animate-rise grid grid-cols-[3rem_1fr] gap-x-4 border-b border-hairline py-6"
                style={rise(3 + i)}
              >
                <span
                  aria-hidden
                  className="font-label text-[0.75rem] tracking-[0.08em] text-clay-deep tabular-nums"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-display text-2xl leading-tight text-ink">
                    {step.label}
                  </p>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p
            className="animate-rise mt-8 text-[0.8125rem] text-ink-muted"
            style={rise(3 + steps.length)}
          >
            Questions?{" "}
            <a
              href={`mailto:${siteInfo.contact.email}`}
              className="link-underline break-all text-ink outline-none"
            >
              {siteInfo.contact.email}
            </a>
            {status === "rejected" && (
              <>
                {" "}
                ·{" "}
                <a
                  href={`tel:${tel}`}
                  className="link-underline text-ink outline-none"
                >
                  {siteInfo.contact.phone}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
