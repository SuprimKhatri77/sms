"use client";

import { MessageSquarePlus, Sparkles, User, Phone, Globe } from "lucide-react";
import Link from "next/link";

interface Props {
  onRefresh?: () => void;
}

interface FeatureCard {
  icon: React.ReactNode;
  label: string;
  desc: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: (
      <User
        className="w-6 h-6"
        style={{ color: "#2d4a3e" }}
        strokeWidth={1.5}
      />
    ),
    label: "Full Name",
    desc: "Visitor's name",
  },
  {
    icon: (
      <Phone
        className="w-6 h-6"
        style={{ color: "#2d4a3e" }}
        strokeWidth={1.5}
      />
    ),
    label: "Phone & Email",
    desc: "Contact details",
  },
  {
    icon: (
      <Globe
        className="w-6 h-6"
        style={{ color: "#2d4a3e" }}
        strokeWidth={1.5}
      />
    ),
    label: "Source",
    desc: "Where they came from",
  },
];

export default function InquiryFormEmpty({ onRefresh }: Props) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[520px] py-20 px-4 relative overflow-hidden">
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #2d4a3e 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-[0.07] pointer-events-none"
        style={{ backgroundColor: "#2d4a3e" }}
      />

      {/* Central icon */}
      <div className="relative mb-10 z-10">
        <div
          className="absolute inset-[-16px] rounded-full border opacity-20 animate-ping"
          style={{ borderColor: "#2d4a3e", animationDuration: "3s" }}
        />
        <div
          className="absolute inset-[-8px] rounded-full border opacity-10"
          style={{ borderColor: "#6b9e6b" }}
        />
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center border-2 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #2d4a3e 0%, #3d6454 100%)",
            borderColor: "#4a7a60",
          }}
        >
          <MessageSquarePlus
            className="w-10 h-10 text-white"
            strokeWidth={1.5}
          />
        </div>
        <div
          className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow"
          style={{ backgroundColor: "#e8552a" }}
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      <h2
        className="text-3xl font-bold text-center mb-3 z-10"
        style={{ color: "#2d4a3e", fontFamily: "Georgia, serif" }}
      >
        Your inbox is spotless
      </h2>

      <p
        className="text-center max-w-sm text-sm leading-relaxed mb-2 z-10"
        style={{ color: "#7d6b8a" }}
      >
        No inquiries have been submitted yet. Once visitors fill out a contact
        form on your site, submissions will show up here in real time.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 w-full max-w-xl z-10">
        {FEATURE_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-4 flex flex-col items-center gap-2 text-center border"
            style={{ backgroundColor: "#fff", borderColor: "#d6cbb8" }}
          >
            {card.icon}
            <p className="text-xs font-semibold" style={{ color: "#2d4a3e" }}>
              {card.label}
            </p>
            <p className="text-xs" style={{ color: "#7d6b8a" }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-10 z-10 justify-center">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#2d4a3e", color: "#fff" }}
          >
            Check Again
          </button>
        )}
        <Link
          href="/admin"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 hover:opacity-80"
          style={{
            borderColor: "#d6cbb8",
            color: "#2d4a3e",
            backgroundColor: "#fff",
          }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
