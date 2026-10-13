import Link from "next/link";
import { ErrorPageShell } from "@/components/error-page-shell";
import { ButtonArrow, siteButton } from "@/components/site/button";

export default function NotFound() {
  return (
    <ErrorPageShell
      watermark="404"
      eyebrow="Page not found"
      title={
        <>
          This page has <em>wandered off.</em>
        </>
      }
      description="The link may be broken, or the page may have moved. Head back home or send us a message — we're happy to help."
      actions={
        <>
          <Link href="/" className={siteButton({ variant: "pine", size: "lg" })}>
            Back to home
            <ButtonArrow />
          </Link>
          <Link
            href="/#inquiry"
            className={siteButton({ variant: "outline", size: "lg" })}
          >
            Contact us
          </Link>
        </>
      }
    />
  );
}
