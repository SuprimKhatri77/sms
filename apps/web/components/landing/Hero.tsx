"use client";

import Link from "next/link";
import { siteInfo } from "@/utils/site-info";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  landingPrimaryButtonClass,
  landingSecondaryButtonClass,
  landingContainerClass,
} from "./landing-styles";
import { cn } from "@/lib/utils";

export default function Hero() {
  const user = useAuthStore((state) => state.user);
  return (
    <section
      id="home"
      aria-labelledby="home-heading"
      className="relative w-full overflow-hidden pb-8 pt-[100px]"
      style={{ background: "var(--brand-cream)" }}
    >
      <div className={cn(landingContainerClass, "px-4 sm:px-6")}>
        {/* ─── MOBILE layout ─── */}
        <div
          className="relative border-x md:hidden"
          style={{
            borderColor: "rgba(194,138,79,0.18)",
            pointerEvents: "none",
          }}
        >
          <svg
            className="absolute inset-0 overflow-visible"
            viewBox="0 0 210 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ color: "rgba(194,138,79,0.18)", pointerEvents: "none" }}
          >
            <g>
              <path
                d="M380.853 105.099L-201.625 464.632"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M-165.247 -267.831L369.777 600.141"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
            </g>
            <g>
              <path
                d="M209.5 260L130 260"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M129.5 339.5L129.5 210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M159.5 260L159.5 210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M3.09944e-06 210L209.5 210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M160 240L130.133 240"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M149.5 240L149.5 260"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>
            <g>
              <rect
                x="159.5"
                y="210"
                width="30"
                height="30"
                transform="rotate(90 159.5 210)"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="149.5"
                y="240"
                width="20"
                height="20"
                transform="rotate(90 149.5 240)"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="159.5"
                y="240"
                width="20"
                height="10"
                transform="rotate(90 159.5 240)"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>
            <path
              d="M149.643 239.897C155.106 239.897 159.619 244.414 159.619 249.882C159.619 255.35 155.106 259.868 149.643 259.868C138.717 259.868 129.69 250.833 129.69 239.897C129.69 223.493 143.23 209.941 159.619 209.941C186.935 209.941 209.5 232.527 209.5 259.868C209.5 303.613 173.396 339.75 129.69 339.75C58.6695 339.75 -1.22732e-05 281.027 -9.16589e-06 209.941C-4.14648e-06 95.1103 94.7738 0.24998 209.5 0.249985C395.69 0.250001 549.5 154.06 549.5 340.25"
              stroke="rgba(194,138,79,0.35)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* content wrapper re-enables pointer events */}
          <div
            className="relative flex flex-col"
            style={{ pointerEvents: "auto" }}
          >
            <MainContent className="w-full" role={user?.role} />
            <div className="w-full px-4 pb-8">
              <VideoPanel />
            </div>
          </div>
        </div>

        {/* ─── DESKTOP layout ─── */}
        <div
          className="relative hidden border-x md:block"
          style={{
            borderColor: "rgba(194,138,79,0.18)",
            pointerEvents: "none",
          }}
        >
          <svg
            className="absolute inset-0 overflow-visible"
            viewBox="0 0 340 210"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ color: "rgba(194,138,79,0.18)", pointerEvents: "none" }}
          >
            <g>
              <path
                d="M105.1 -170.853L464.633 411.625"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M-267.831 375.247L600.141 -159.777"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
            </g>
            <g>
              <path
                d="M260 0.5V80"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M339.5 80.5H210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M210 210V0.5"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>
            <g>
              <rect
                x="210"
                y="50.5"
                width="30"
                height="30"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="240"
                y="60.5"
                width="20"
                height="20"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="240"
                y="50.5"
                width="20"
                height="10"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>
            <path
              d="M239.897 60.3571C239.897 54.894 244.414 50.381 249.882 50.381C255.35 50.381 259.868 54.894 259.868 60.3571C259.868 71.2835 250.833 80.3095 239.897 80.3095C223.493 80.3095 209.941 66.7704 209.941 50.381C209.941 23.0652 232.527 0.499999 259.868 0.5C303.613 0.499995 339.75 36.6043 339.75 80.3095C339.75 151.33 281.027 210 209.941 210C95.1103 210 0.25 115.226 0.25 0.5C0.250008 -185.69 154.06 -339.5 340.25 -339.5"
              stroke="rgba(194,138,79,0.35)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* content wrapper re-enables pointer events */}
          <div
            className="relative grid aspect-[1.618/1] grid-cols-[1.618fr_minmax(0,1fr)] grid-rows-[1fr_1.618fr]"
            style={{ pointerEvents: "auto" }}
          >
            <MainContent className="col-1 row-[1/span_2]" role={user?.role} />
            <div className="col-2 row-1" />
            <div className="col-2 row-2 flex items-center justify-center overflow-hidden p-4 lg:p-8">
              <VideoPanel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MainContent({
  className,
  role,
}: {
  className?: string;
  role?: "admin" | "superadmin" | "student" | "instructor";
}) {
  const router = useRouter();
  const handleAdmissionClick = () => {
    if (!role) {
      toast.info("Please log in to access the admission form.");
      return;
    }

    if (role === "student") {
      router.push("/admission");
    } else {
      toast.info("Only student accounts can submit admission forms.");
    }
  };
  return (
    <div
      className={`flex flex-col justify-center overflow-hidden p-6 lg:p-10 ${className ?? ""}`}
    >
      {/* Admission badge */}
      {/* <div
        className="mb-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5"
        style={{
          border: "1px solid rgba(194,138,79,0.35)",
          background: "rgba(194,138,79,0.1)",
        }}
      >
        <span
          className="h-[7px] w-[7px] rounded-full"
          style={{ background: "var(--brand-brown)" }}
        />
        <span
          className="text-[0.78rem] font-medium tracking-widest uppercase"
          style={{
            color: "var(--brand-brown)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {siteInfo.admission.cycleLabel}
        </span>
      </div> */}

      {/* Headline */}
      <h1
        id="home-heading"
        className="mb-5 font-heading leading-[1.08] font-bold tracking-tight text-[2.2rem] sm:text-[2.8rem] lg:text-[3.2rem] xl:text-[3.6rem]"
        style={{
          color: "var(--brand-ink)",
          fontFamily: "var(--font-playfair)",
        }}
      >
        <span style={{ color: "var(--brand-brown)" }}>Brew.</span> Bake.
        <br />
        <em
          className="font-medium"
          style={{ color: "var(--brand-green)", fontStyle: "italic" }}
        >
          Build a Career.
        </em>
      </h1>

      {/* Body */}
      <p
        className="mb-8 max-w-[400px] text-[0.95rem] leading-relaxed sm:text-base"
        style={{
          color: "rgba(26,26,26,0.55)",
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        Practical training. Industry mentors.{" "}
        <span style={{ color: "rgba(26,26,26,0.75)", fontWeight: 500 }}>
          Graduate job-ready, not just certified.
        </span>
      </p>

      {/* CTAs */}
      <div className="mb-8 flex flex-wrap gap-3 sm:gap-4">
        <button
          type="button"
          onClick={handleAdmissionClick}
          aria-label="Apply for admission to Brew and Bake Academy"
          className={`${landingPrimaryButtonClass} px-7 py-3 text-[0.92rem] tracking-[0.02em]`}
          style={{ boxShadow: "0 4px 18px rgba(194,138,79,0.3)" }}
        >
          Apply for Admission
        </button>
        <Link
          href="#inquiry"
          className={`${landingSecondaryButtonClass} px-7 py-3 text-[0.92rem] font-medium`}
        >
          Send Inquiry
        </Link>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-6 sm:gap-8">
        {siteInfo.stats.map((stat: { number: string; label: string }) => (
          <div key={stat.label}>
            <div
              className="text-xl font-bold leading-none sm:text-2xl"
              style={{
                color: "var(--brand-brown)",
                fontFamily: "var(--font-lora)",
              }}
            >
              {stat.number}
            </div>
            <div
              className="mt-0.5 text-[0.75rem] leading-snug"
              style={{
                color: "rgba(26,26,26,0.45)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoPanel() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "16/10",
        boxShadow:
          "0 8px 40px rgba(47,78,64,0.18), 0 0 0 1px rgba(194,138,79,0.15)",
      }}
    >
      <video
        src="https://www.pexels.com/download/video/8935791/"
        autoPlay
        muted
        loop
        playsInline
        aria-label="Live barista and hospitality training sessions at Brew and Bake Academy Butwal"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(47,78,64,0.25) 0%, rgba(47,78,64,0.05) 60%, transparent 100%)",
        }}
      />
      <div
        className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1"
        style={{
          background: "rgba(251,250,247,0.85)",
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--brand-brown)" }}
        />
        <span
          className="text-[0.7rem] font-medium tracking-wide"
          style={{
            color: "var(--brand-ink)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          Live training sessions
        </span>
      </div>
    </div>
  );
}
