import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavLink {
  label: string;
  href: string;
}

interface ContactItem {
  icon: React.ReactNode;
  text: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const FacebookIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z" />
  </svg>
);

const MapPinIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.18 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.28-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const socialLinks: SocialLink[] = [
  { label: "Facebook", href: "#", icon: <FacebookIcon /> },
  { label: "Instagram", href: "#", icon: <InstagramIcon /> },
  { label: "TikTok", href: "#", icon: <TikTokIcon /> },
];

const quickLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Why Greenfield", href: "#why-us" },
  { label: "Programs", href: "#programs" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Inquire", href: "#inquiry" },
];

const contactInfo: ContactItem[] = [
  { icon: <MapPinIcon />, text: "123 Academy Road, Greenfield City" },
  { icon: <PhoneIcon />, text: "+1 (555) 000-1234" },
  { icon: <MailIcon />, text: "info@greenfieldacademy.edu" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="pt-16 text-white"
      style={{ backgroundColor: "var(--brand-green)" }}
    >
      <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* ── Brand Column ── */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-4">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{
                backgroundColor: "var(--brand-orange)",
                fontFamily: "var(--font-playfair)",
              }}
              aria-hidden="true"
            >
              G
            </span>
            <span
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Greenfield{" "}
              <span style={{ color: "var(--brand-cream)" }}>Academy</span>
            </span>
          </div>

          {/* Tagline */}
          <p
            className="text-sm leading-relaxed mb-6 max-w-[260px]"
            style={{
              fontFamily: "var(--font-dm-sans)",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Nurturing young minds and shaping tomorrow&apos;s leaders through
            quality, compassionate education.
          </p>

          {/* Social Icons */}
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors duration-200"
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.75)",
                }}
                // Tailwind JIT can't read CSS vars in hover, so we use a group trick via CSS class
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "var(--brand-orange)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "var(--brand-orange)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "rgba(255,255,255,0.2)";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(255,255,255,0.75)";
                }}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div>
          <h4
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{
              fontFamily: "var(--font-dm-sans)",
              color: "var(--brand-cream)",
            }}
          >
            Quick Links
          </h4>
          <ul className="flex flex-col gap-3">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="group flex items-center gap-2 text-sm transition-colors duration-200"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    color: "rgba(255,255,255,0.65)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "var(--brand-cream)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.65)")
                  }
                >
                  <span style={{ color: "var(--brand-sage)" }}>
                    <ChevronRightIcon />
                  </span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Contact ── */}
        <div>
          <h4
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{
              fontFamily: "var(--font-dm-sans)",
              color: "var(--brand-cream)",
            }}
          >
            Contact Us
          </h4>
          <div className="flex flex-col gap-4">
            {contactInfo.map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--brand-sage)" }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div>
          <h4
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{
              fontFamily: "var(--font-dm-sans)",
              color: "var(--brand-cream)",
            }}
          >
            Ready to Join?
          </h4>
          <p
            className="text-sm leading-relaxed mb-5"
            style={{
              fontFamily: "var(--font-dm-sans)",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Begin your child&apos;s journey toward excellence. Applications are
            open for the upcoming academic year.
          </p>
          <Link
            href="/admission"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-85"
            style={{
              backgroundColor: "var(--brand-orange)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Start Application
            <ArrowRightIcon />
          </Link>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div
        className="mt-12 px-6 py-5 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <p
          className="text-xs"
          style={{
            fontFamily: "var(--font-dm-sans)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          &copy; {year} Greenfield Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
