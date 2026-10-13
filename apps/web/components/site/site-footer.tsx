import Link from "next/link";
import {
  FacebookLogoIcon,
  InstagramLogoIcon,
  TiktokLogoIcon,
} from "@phosphor-icons/react/ssr";
import { siteInfo } from "@/utils/site-info";
import { ButtonArrow, siteButton } from "./button";
import { SiteLogo } from "./logo";
import { primaryNav } from "./nav-links";

const socials = [
  { label: "Facebook", href: siteInfo.social.facebook, Icon: FacebookLogoIcon },
  { label: "Instagram", href: siteInfo.social.instagram, Icon: InstagramLogoIcon },
  { label: "TikTok", href: siteInfo.social.tiktok, Icon: TiktokLogoIcon },
];

const linkClass =
  "link-underline text-paper/70 outline-none transition-colors hover:text-paper focus-visible:text-paper";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { contact, company } = siteInfo;

  return (
    <footer className="relative mt-auto overflow-hidden bg-pine font-site text-paper">
      <div className="container-page grid gap-12 pt-16 pb-10 sm:pt-20 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div className="space-y-6">
          <SiteLogo tone="light" />
          <p className="display max-w-sm text-3xl text-paper sm:text-4xl">
            Craft, <em>taught properly.</em>
          </p>
          <p className="max-w-xs text-[0.8125rem] leading-relaxed text-paper/65">
            {company.tagline}
          </p>
          <ul className="flex gap-2">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={siteButton({ variant: "outline-light", size: "icon" })}
                >
                  <Icon weight="light" className="size-[1.15rem]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow mb-5 text-paper/50">Explore</p>
          <ul className="space-y-3 text-[0.8125rem]">
            {primaryNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-5 text-paper/50">Visit</p>
          <address className="space-y-3 text-[0.8125rem] not-italic">
            <p className="text-paper/70">{contact.address}</p>
            <p>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className={linkClass}>
                {contact.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${contact.email}`} className={`${linkClass} break-all`}>
                {contact.email}
              </a>
            </p>
            <p className="text-paper/70">{contact.officeHours}</p>
          </address>
        </div>

        <div>
          <p className="eyebrow mb-5 text-paper/50">Admissions</p>
          <p className="mb-6 max-w-xs text-[0.8125rem] leading-relaxed text-paper/70">
            Applications are open for the upcoming intake. Start yours in a
            few minutes.
          </p>
          <Link
            href="/admission"
            className={siteButton({ variant: "light", size: "lg" })}
          >
            Start application
            <ButtonArrow />
          </Link>
        </div>
      </div>

      {/* Oversized, cropped wordmark. */}
      <p
        aria-hidden
        className="container-page pointer-events-none font-display text-[clamp(4.5rem,17vw,17rem)] leading-[0.8] tracking-[-0.04em] whitespace-nowrap text-paper/[0.07] select-none"
      >
        Brew &amp; Bake
      </p>

      <div className="relative border-t border-white/15">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {company.shortName}. All rights reserved.
          </p>
          <p className="font-label tracking-[0.08em] uppercase">
            PAN {company.panNo} · Reg. {company.registrationNo}
          </p>
        </div>
      </div>
    </footer>
  );
}
