"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { siteInfo } from "@/utils/site-info";
import { cn } from "@/lib/utils";
import {
  studentStatusBentoClass,
  studentStatusBodyClass,
  studentStatusPrimaryBtnClass,
  studentStatusTitleClass,
} from "./student-status-styles";
import { StudentStatusHelp } from "./StudentStatusHelp";
import { StudentStatusPage } from "./StudentStatusPage";

interface RejectedErrorProps {
  message: string;
  reset: () => void;
}

export default function RejectedError({ message, reset }: RejectedErrorProps) {
  return (
    <StudentStatusPage variant="rejected">
      <div className={cn(studentStatusBentoClass, "p-8 text-center sm:p-10")}>
        <p className="font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-(--brand-green)">
          Something went wrong
        </p>
        <h1 className={cn(studentStatusTitleClass, "mt-3")}>
          Couldn&apos;t load your decision
        </h1>
        <p className={cn(studentStatusBodyClass, "mx-auto mt-3 max-w-md")}>
          Your decision is safe — this is a temporary loading issue on our end.
        </p>
        <p className="mt-3 font-[family-name:var(--font-dm-sans)] text-[0.78rem] text-[rgba(47,78,64,0.4)]">
          {message}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className={studentStatusPrimaryBtnClass}>
            <RefreshCw className="h-4 w-4" strokeWidth={2} />
            Try again
          </button>
          <Link
            href={`mailto:${siteInfo.contact.email}`}
            className="font-[family-name:var(--font-dm-sans)] text-[0.88rem] font-semibold text-(--brand-green) underline-offset-2 hover:underline"
          >
            Contact admissions
          </Link>
        </div>
      </div>
      <div className="mt-8 text-center">
        <StudentStatusHelp />
      </div>
    </StudentStatusPage>
  );
}
