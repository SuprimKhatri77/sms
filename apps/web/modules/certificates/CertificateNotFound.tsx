import Link from "next/link";
import { ErrorPageShell } from "@/components/error-page-shell";
import { ButtonArrow, siteButton } from "@/components/site/button";

export function CertificateNotFound() {
  return (
    <ErrorPageShell
      eyebrow="Verification"
      title={
        <>
          Certificate <em>not found.</em>
        </>
      }
      description="We couldn't find a certificate matching this verification link. Please check the URL or QR code and try again, or contact the academy if you believe this is an error."
      actions={
        <>
          <Link href="/" className={siteButton({ variant: "pine", size: "lg" })}>
            Back to home
            <ButtonArrow />
          </Link>
          <Link
            href="/courses"
            className={siteButton({ variant: "outline", size: "lg" })}
          >
            View courses
          </Link>
        </>
      }
    />
  );
}
