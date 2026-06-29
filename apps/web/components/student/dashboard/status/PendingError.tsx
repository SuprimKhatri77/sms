"use client";

import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  studentStatusBentoClass,
  studentStatusPrimaryBtnClass,
  studentStatusSecondaryBtnClass,
  studentStatusTitleClass,
  studentStatusBodyClass,
} from "./student-status-styles";
import { StudentStatusHelp } from "./StudentStatusHelp";
import { StudentStatusPage } from "./StudentStatusPage";

interface PendingErrorProps {
  message: string;
  reset: () => void;
}

export default function PendingError({ message, reset }: PendingErrorProps) {
  return (
    <StudentStatusPage variant="pending">
      <div className={cn(studentStatusBentoClass, "p-8 text-center sm:p-10")}>
        <p className="font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-(--brand-brown)">
          Something went wrong
        </p>
        <h1 className={cn(studentStatusTitleClass, "mt-3")}>
          Couldn&apos;t load your status
        </h1>
        <p className={cn(studentStatusBodyClass, "mx-auto mt-3 max-w-md")}>
          We had trouble fetching your application status. This is usually
          temporary.
        </p>
        <p className="mt-3 font-[family-name:var(--font-dm-sans)] text-[0.78rem] text-[rgba(47,78,64,0.4)]">
          {message}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className={studentStatusPrimaryBtnClass}>
            <RefreshCw className="h-4 w-4" strokeWidth={2} />
            Try again
          </button>
          <Link href="/" className={studentStatusSecondaryBtnClass}>
            <Home className="h-4 w-4" strokeWidth={2} />
            Back to home
          </Link>
        </div>
      </div>
      <div className="mt-8 text-center">
        <StudentStatusHelp />
      </div>
    </StudentStatusPage>
  );
}
