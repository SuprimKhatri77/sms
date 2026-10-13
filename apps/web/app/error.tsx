"use client";

import Link from "next/link";
import { ErrorPageShell } from "@/components/error-page-shell";
import { siteButton } from "@/components/site/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPageShell
      eyebrow="Something went wrong"
      title={
        <>
          Let&apos;s try <em>that again.</em>
        </>
      }
      description="We ran into an unexpected issue. You can retry, or return home and continue from there."
      actions={
        <>
          <button
            type="button"
            onClick={reset}
            className={siteButton({ variant: "pine", size: "lg" })}
          >
            Try again
          </button>
          <Link href="/" className={siteButton({ variant: "outline", size: "lg" })}>
            Back to home
          </Link>
        </>
      }
    />
  );
}
