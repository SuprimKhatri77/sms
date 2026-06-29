import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type BackdropVariant = "onboarding" | "pending" | "rejected";

const blobs: Record<
  BackdropVariant,
  { className: string; style?: CSSProperties }[]
> = {
  onboarding: [
    {
      className:
        "absolute -right-24 -top-20 h-72 w-72 rounded-full opacity-[0.14] blur-3xl",
      style: { background: "var(--brand-brown)" },
    },
    {
      className:
        "absolute -left-20 top-1/3 h-64 w-64 rounded-full opacity-[0.08] blur-3xl",
      style: { background: "var(--brand-green)" },
    },
  ],
  pending: [
    {
      className:
        "absolute right-0 top-0 h-80 w-80 rounded-full opacity-[0.12] blur-3xl",
      style: { background: "var(--brand-brown)" },
    },
    {
      className:
        "absolute -left-16 bottom-0 h-56 w-56 rounded-full opacity-[0.06] blur-3xl",
      style: { background: "var(--brand-green)" },
    },
  ],
  rejected: [
    {
      className:
        "absolute -right-16 top-12 h-64 w-64 rounded-full opacity-[0.08] blur-3xl",
      style: { background: "var(--brand-green)" },
    },
    {
      className:
        "absolute left-1/4 bottom-0 h-48 w-48 rounded-full opacity-[0.05] blur-3xl",
      style: { background: "var(--brand-brown)" },
    },
  ],
};

export function StudentStatusBackdrop({
  variant,
}: {
  variant: BackdropVariant;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {blobs[variant].map((blob, i) => (
        <div key={i} className={blob.className} style={blob.style} />
      ))}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(47,78,64,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47,78,64,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black, transparent)",
        }}
      />
    </div>
  );
}

export function StudentStatusPage({
  variant,
  children,
  className,
}: {
  variant: BackdropVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative py-8 sm:py-10 lg:py-12", className)}>
      <StudentStatusBackdrop variant={variant} />
      <div className={cn("relative", "mx-auto w-full max-w-3xl px-1")}>
        {children}
      </div>
    </div>
  );
}
