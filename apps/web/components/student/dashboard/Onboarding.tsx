"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileText,
  GraduationCap,
  Sparkles,
  Timer,
} from "lucide-react";
import { siteInfo } from "@/utils/site-info";
import { cn } from "@/lib/utils";
import { InfoBento } from "./status/StatusCards";
import { StatusHero } from "./status/StatusHero";
import { StudentStatusPage } from "./status/StudentStatusPage";
import { TrackingStepper } from "./status/TrackingStepper";
import {
  studentStatusHighlightCardClass,
  studentStatusPrimaryBtnClass,
} from "./status/student-status-styles";
import { StudentStatusHelp } from "./status/StudentStatusHelp";

const TRACKING_STEPS = [
  { id: "signup", label: "Account created", state: "done" as const },
  { id: "admission", label: "Admission form", state: "active" as const },
  { id: "review", label: "Under review", state: "upcoming" as const },
  { id: "start", label: "Start training", state: "upcoming" as const },
];

export default function OnboardingPage() {
  return (
    <StudentStatusPage variant="onboarding">
      <StatusHero
        badge={
          <>
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            Action required
          </>
        }
        badgeTone="brown"
        title={
          <>
            You&apos;re{" "}
            <em
              className="font-medium text-(--brand-brown)"
              style={{ fontStyle: "italic" }}
            >
              almost in.
            </em>
          </>
        }
        subtitle={`Your account is live — complete the admission form so we can build your student profile at ${siteInfo.company.shortName}.`}
      />

      <div className="mb-10">
        <TrackingStepper steps={TRACKING_STEPS} />
      </div>

      <div className={studentStatusHighlightCardClass}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-(--brand-green) via-(--brand-brown) to-(--brand-green)"
          aria-hidden
        />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-[rgba(194,138,79,0.1)] text-(--brand-brown)">
              <FileText className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[rgba(47,78,64,0.42)]">
                Next step
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-playfair)] text-[1.35rem] font-semibold text-(--brand-green)">
                Complete your admission form
              </h2>
              <p className="mt-2 font-[family-name:var(--font-dm-sans)] text-[0.86rem] leading-relaxed text-[rgba(47,78,64,0.55)]">
                About 5 minutes · personal details, guardian info & course
                preferences
              </p>
            </div>
          </div>
          <Link
            href="/admission"
            className={cn(studentStatusPrimaryBtnClass, "shrink-0 sm:px-8")}
          >
            Start application
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <InfoBento
          items={[
            {
              icon: Timer,
              label: "Time needed",
              value: "~5 minutes to complete",
            },
            {
              icon: Clock,
              label: "Review time",
              value: "Usually within 1 business day",
            },
            {
              icon: GraduationCap,
              label: "After approval",
              value: "Full dashboard unlocks",
            },
          ]}
        />
      </div>

      <div className="mt-10 text-center">
        <StudentStatusHelp />
      </div>
    </StudentStatusPage>
  );
}

export function OnboardingLoading() {
  const shimmer =
    "animate-pulse bg-[rgba(47,78,64,0.08)]";

  return (
    <StudentStatusPage variant="onboarding">
      <div className={`mx-auto mb-8 h-8 w-36 ${shimmer}`} />
      <div className={`mx-auto mb-4 h-12 w-full max-w-md ${shimmer}`} />
      <div className={`mx-auto mb-10 h-4 w-full max-w-sm ${shimmer}`} />
      <div className={`mb-10 h-20 w-full ${shimmer}`} />
      <div className={`h-40 w-full ${shimmer}`} />
    </StudentStatusPage>
  );
}
