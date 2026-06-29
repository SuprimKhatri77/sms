"use client";

import api from "@/lib/axios";
import { GetStudentRejectedOverviewResponse } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Compass,
  Mail,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { siteInfo } from "@/utils/site-info";
import RejectedLoading from "./RejectedLoading";
import RejectedError from "./RejectedError";
import { OptionCardGrid } from "./StatusCards";
import { StatusHero } from "./StatusHero";
import { StudentStatusPage } from "./StudentStatusPage";
import { StudentStatusHelp } from "./StudentStatusHelp";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function RejectedStatus() {
  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: ["student-portal-rejected"],
    queryFn: async () => {
      const res = await api.get<GetStudentRejectedOverviewResponse>(
        "/portal/student/rejected-overview",
      );
      const parsed = res.data;
      if (!parsed.success)
        throw new Error(parsed.message ?? "Something went wrong");
      return parsed.data;
    },
  });

  if (isPending) return <RejectedLoading />;
  if (isError) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return <RejectedError message={message} reset={refetch} />;
  }

  const firstName = data.fullName.split(" ")[0] ?? "Student";

  return (
    <StudentStatusPage variant="rejected">
      <StatusHero
        badge="Not accepted this cycle"
        badgeTone="muted"
        title={
          <>
            Thank you for applying,{" "}
            <em
              className="font-medium text-(--brand-green)"
              style={{ fontStyle: "italic" }}
            >
              {firstName}.
            </em>
          </>
        }
        subtitle={`We gave your application careful consideration but aren't able to offer a place at ${siteInfo.company.shortName} this intake. That doesn't mean the door is closed.`}
      >
        <div className="inline-flex items-center gap-2 border border-[rgba(47,78,64,0.12)] bg-white px-4 py-2 font-[family-name:var(--font-dm-sans)] text-[0.84rem] text-[rgba(47,78,64,0.62)]">
          <Calendar className="h-4 w-4 text-(--brand-green)" strokeWidth={1.75} />
          Decision on {formatDate(data.decidedAt)}
        </div>
      </StatusHero>

      {data.rejectionReason ? (
        <div className="mb-8 border-l-[3px] border-(--brand-green) bg-[rgba(47,78,64,0.04)] px-5 py-4">
          <p className="font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.42)]">
            Note from admissions
          </p>
          <p className="mt-2 font-[family-name:var(--font-dm-sans)] text-[0.9rem] leading-relaxed text-[rgba(47,78,64,0.65)]">
            {data.rejectionReason}
          </p>
        </div>
      ) : null}

      <p className="mb-5 font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[rgba(47,78,64,0.4)]">
        What you can do next
      </p>

      <OptionCardGrid
        cards={[
          {
            icon: RotateCcw,
            title: "Reapply next cycle",
            description:
              "Admissions reopen every cycle. Many strong students join us on a second try.",
            href: "/admission",
            accent: "brown",
          },
          {
            icon: Mail,
            title: "Talk to admissions",
            description:
              "Ask what to improve or get clarity on the decision — we're here to help.",
            href: `mailto:${siteInfo.contact.email}`,
            external: true,
            accent: "green",
          },
          {
            icon: Compass,
            title: "Browse programs",
            description:
              "Explore workshops and courses — another path might be a better fit right now.",
            href: "/#programs",
            accent: "green",
          },
        ]}
      />

      <blockquote className="mt-10 border border-[rgba(47,78,64,0.1)] bg-white p-6 text-center sm:p-8">
        <MessageCircle
          className="mx-auto mb-4 h-5 w-5 text-(--brand-brown)"
          strokeWidth={1.75}
        />
        <p className="font-[family-name:var(--font-lora)] text-[1rem] italic leading-relaxed text-[rgba(47,78,64,0.62)]">
          &ldquo;Every great barista and baker started somewhere. This is a
          chapter, not the end of your story with us.&rdquo;
        </p>
        <footer className="mt-3 font-[family-name:var(--font-dm-sans)] text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[rgba(47,78,64,0.38)]">
          — {siteInfo.company.shortName} Admissions
        </footer>
      </blockquote>

      <div className="mt-10 text-center">
        <StudentStatusHelp />
      </div>
    </StudentStatusPage>
  );
}
