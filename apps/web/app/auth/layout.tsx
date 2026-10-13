import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import { SiteLogo } from "@/components/site/logo";
import { siteInfo } from "@/utils/site-info";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop";

/** Form on one half, a photo with a pull quote on the other. */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="grid min-h-svh bg-paper font-site text-ink lg:grid-cols-2">
      <div className="flex flex-col">
        <header className="flex items-center justify-between gap-4 px-6 pt-6 sm:px-10 sm:pt-8">
          <SiteLogo />
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-[0.8125rem] text-ink-muted outline-none hover:text-ink focus-visible:text-ink"
          >
            <ArrowLeftIcon
              aria-hidden
              className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:-translate-x-0.5"
            />
            <span className="link-underline group-hover:bg-size-[100%_1px] group-focus-visible:bg-size-[100%_1px]">
              Back to site
            </span>
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-14 sm:px-10">
          {children}
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-surface lg:block">
        <Image
          src={AUTH_IMAGE}
          alt="Two cups of latte art raised together over a café table"
          fill
          preload
          sizes="50vw"
          className="animate-hero-settle object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
        />
        <blockquote className="absolute inset-x-0 bottom-0 p-12 text-paper xl:p-16">
          <p className="display max-w-md text-5xl">
            Every great cup starts with a <em>first lesson.</em>
          </p>
          <footer className="mt-5 font-label text-[0.6875rem] tracking-[0.16em] text-paper/75 uppercase">
            {siteInfo.company.shortName} · Butwal
          </footer>
        </blockquote>
      </div>
    </main>
  );
}
