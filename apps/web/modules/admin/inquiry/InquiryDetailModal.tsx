"use client";

import {
  X,
  Phone,
  Mail,
  Globe,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useEffect } from "react";
import { Inquiry } from "./Inquiry";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";

interface Props {
  inquiry: Inquiry | null;
  onClose: () => void;
  onMarkRead: (id: string) => void;
}

interface SourceColor {
  bg: string;
  text: string;
  border: string;
}

const SOURCE_COLORS: Record<string, SourceColor> = {
  website: { bg: "rgba(47,78,64,0.08)", text: "#2f4e40", border: "rgba(47,78,64,0.2)" },
  facebook: { bg: "rgba(58,90,73,0.08)", text: "#3a5a49", border: "rgba(58,90,73,0.2)" },
  instagram: { bg: "rgba(194,138,79,0.1)", text: "#a06d3a", border: "rgba(194,138,79,0.25)" },
  referral: { bg: "rgba(194,138,79,0.14)", text: "#8f5f31", border: "rgba(194,138,79,0.3)" },
  other: { bg: "rgba(251,250,247,0.9)", text: "#7a5a38", border: "rgba(47,78,64,0.15)" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InquiryDetailModal({
  inquiry,
  onClose,
  onMarkRead,
}: Props) {
  useEffect(() => {
    if (!inquiry) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [inquiry, onClose]);

  if (!inquiry) return null;

  const sc: SourceColor =
    SOURCE_COLORS[inquiry.source?.toLowerCase()] ?? SOURCE_COLORS.other;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[rgba(26,26,26,0.45)] backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[rgba(47,78,64,0.18)] bg-(--brand-cream) shadow-[0_0_40px_rgba(0,0,0,0.12)] sm:w-[480px]">
        <div className="flex items-center justify-between border-b border-[rgba(47,78,64,0.12)] bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-(--brand-green) font-[family-name:var(--font-dm-sans)] text-base font-bold text-white">
              {inquiry.fullName[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-lora)] text-base font-bold leading-tight text-(--brand-green)">
                {inquiry.fullName}
              </h2>
              <div className="mt-0.5 flex items-center gap-1.5">
                {inquiry.isRead ? (
                  <span className="flex items-center gap-1 font-[family-name:var(--font-dm-sans)] text-xs text-[#3a5a49]">
                    <CheckCircle2 className="h-3 w-3" /> Read
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-[family-name:var(--font-dm-sans)] text-xs font-semibold text-(--brand-brown)">
                    <Clock className="h-3 w-3" /> Unread
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-[rgba(47,78,64,0.18)] transition-colors hover:bg-[rgba(47,78,64,0.04)]"
          >
            <X className="h-4 w-4 text-(--brand-green)" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-[rgba(47,78,64,0.45)]" />
            <span className="font-[family-name:var(--font-dm-sans)] text-xs font-medium text-[rgba(47,78,64,0.45)]">
              Source
            </span>
            <span
              className="ml-auto border px-3 py-1 font-[family-name:var(--font-dm-sans)] text-xs font-semibold capitalize"
              style={{
                backgroundColor: sc.bg,
                color: sc.text,
                borderColor: sc.border,
              }}
            >
              {inquiry.source}
            </span>
          </div>

          <hr className="border-[rgba(47,78,64,0.12)]" />

          <div className="space-y-3">
            <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold tracking-[0.12em] text-[rgba(47,78,64,0.45)] uppercase">
              Contact Details
            </p>
            <div className="space-y-3 border border-[rgba(47,78,64,0.12)] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)]">
                  <Phone className="h-3.5 w-3.5 text-(--brand-green)" />
                </div>
                <div>
                  <p className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
                    Phone
                  </p>
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-green) hover:underline"
                  >
                    {inquiry.phone}
                  </a>
                </div>
              </div>

              {inquiry.email && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)]">
                    <Mail className="h-3.5 w-3.5 text-(--brand-green)" />
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
                      Email
                    </p>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-green) hover:underline"
                    >
                      {inquiry.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-[rgba(47,78,64,0.45)]" />
              <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold tracking-[0.12em] text-[rgba(47,78,64,0.45)] uppercase">
                Message
              </p>
            </div>
            <div className="border border-[rgba(47,78,64,0.12)] bg-white p-5 font-[family-name:var(--font-dm-sans)] text-sm leading-relaxed whitespace-pre-wrap text-(--brand-ink)">
              {inquiry.message}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Calendar className="h-3.5 w-3.5 text-[rgba(47,78,64,0.45)]" />
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
              Received: {formatDate(String(inquiry.createdAt))}
            </p>
          </div>

          <div className="border border-[rgba(47,78,64,0.12)] bg-[rgba(251,250,247,0.9)] px-4 py-2.5">
            <p className="font-mono text-xs text-[rgba(47,78,64,0.45)]">
              ID: {inquiry.id}
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-[rgba(47,78,64,0.12)] bg-white px-6 py-4">
          {!inquiry.isRead && (
            <button
              onClick={() => {
                onMarkRead(inquiry.id);
              }}
              className={`${adminPrimaryButtonClass} flex-1 justify-center`}
            >
              Mark as Read
            </button>
          )}
          <button
            onClick={onClose}
            className={`${adminSecondaryButtonClass} flex-1 justify-center`}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
