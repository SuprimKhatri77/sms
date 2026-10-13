"use client";

import Link from "next/link";
import { ErrorPageShell } from "@/components/error-page-shell";
import { siteButton } from "@/components/site/button";

export default function CertificateError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPageShell
      eyebrow="Verification"
      title={
        <>
          Unable to load <em>this certificate.</em>
        </>
      }
      description="We couldn't retrieve this certificate right now. Please try again, or return home and verify the link you received."
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
