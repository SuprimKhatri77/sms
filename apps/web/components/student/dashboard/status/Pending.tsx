"use client";

import api from "@/lib/axios";
import { GetStudentPendingOverviewResponse } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Bell, Calendar, Clock, Home, Inbox } from "lucide-react";
import PendingLoading from "./PendingLoading";
import PendingError from "./PendingError";
import { InfoBento } from "./StatusCards";
import { StatusHero } from "./StatusHero";
import { StudentStatusPage } from "./StudentStatusPage";
import { TrackingStepper } from "./TrackingStepper";
import { studentStatusSecondaryBtnClass } from "./student-status-styles";
import { StudentStatusHelp } from "./StudentStatusHelp";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PendingStatus() {
  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: ["student-portal-pending"],
    queryFn: async () => {
      const res = await api.get<GetStudentPendingOverviewResponse>(
        "/portal/student/pending-overview",
      );
      const parsed = res.data;
      if (!parsed.success)
        throw new Error(parsed.message ?? "Something went wrong");
      return parsed.data;
    },
  });

  if (isPending) return <PendingLoading />;
  if (isError) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return <PendingError message={message} reset={refetch} />;
  }

  const firstName = data.fullName.split(" ")[0] ?? "Student";

  const steps = [
    {
      id: "submitted",
      label: "Submitted",
      description: formatShortDate(data.submittedAt),
      state: "done" as const,
    },
    {
      id: "review",
      label: "Under review",
      description: "2–3 business days",
      state: "active" as const,
    },
    {
      id: "decision",
      label: "Decision",
      description: "Email & phone",
      state: "upcoming" as const,
    },
    {
      id: "onboard",
      label: "Onboarding",
      description: "Batch & schedule",
      state: "upcoming" as const,
    },
  ];

  return (
    <StudentStatusPage variant="pending">
      <StatusHero
        badge={
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--brand-brown) opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-(--brand-brown)" />
            </span>
            Under review
          </>
        }
        badgeTone="brown"
        title={
          <>
            Hang tight,{" "}
            <em
              className="font-medium text-(--brand-brown)"
              style={{ fontStyle: "italic" }}
            >
              {firstName}.
            </em>
          </>
        }
        subtitle="Your application is with our admissions team. We'll notify you the moment a decision is ready — nothing else needed from you right now."
      >
        <div className="inline-flex items-center gap-2 border border-[rgba(47,78,64,0.12)] bg-white px-4 py-2 font-[family-name:var(--font-dm-sans)] text-[0.84rem] text-[rgba(47,78,64,0.62)]">
          <Calendar className="h-4 w-4 text-(--brand-brown)" strokeWidth={1.75} />
          Submitted {formatDate(data.submittedAt)}
        </div>
      </StatusHero>

      <div className="mb-10 border border-[rgba(47,78,64,0.1)] bg-white p-6 sm:p-8">
        <p className="mb-6 font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[rgba(47,78,64,0.4)]">
          Application status
        </p>
        <TrackingStepper steps={steps} />
      </div>

      <InfoBento
        items={[
          {
            icon: Clock,
            label: "Typical wait",
            value: "2–3 business days",
          },
          {
            icon: Bell,
            label: "How we notify",
            value: "Email & phone call",
          },
          {
            icon: Inbox,
            label: "Your part",
            value: "No action needed now",
          },
        ]}
      />

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <StudentStatusHelp />
        <Link href="/" className={cn(studentStatusSecondaryBtnClass, "shrink-0")}>
          <Home className="h-4 w-4" strokeWidth={2} />
          Back to home
        </Link>
      </div>
    </StudentStatusPage>
  );
}
