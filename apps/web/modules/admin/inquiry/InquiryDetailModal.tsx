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
  website: { bg: "#2d4a3e11", text: "#2d4a3e", border: "#2d4a3e22" },
  facebook: { bg: "#6b9e6b11", text: "#4a7a60", border: "#6b9e6b33" },
  instagram: { bg: "#7d6b8a11", text: "#7d6b8a", border: "#7d6b8a33" },
  referral: { bg: "#e8552a11", text: "#e8552a", border: "#e8552a33" },
  other: { bg: "#d6cbb833", text: "#7d6b8a", border: "#d6cbb8" },
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(45,74,62,0.45)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] shadow-2xl flex flex-col"
        style={{ backgroundColor: "#faf9f7" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "#d6cbb8", backgroundColor: "#fff" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
              style={{ backgroundColor: "#2d4a3e", color: "#fff" }}
            >
              {inquiry.full_name[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h2
                className="text-base font-bold leading-tight"
                style={{ color: "#2d4a3e", fontFamily: "Georgia, serif" }}
              >
                {inquiry.full_name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                {inquiry.is_read ? (
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "#6b9e6b" }}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Read
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: "#e8552a" }}
                  >
                    <Clock className="w-3 h-3" /> Unread
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:opacity-70"
            style={{ backgroundColor: "#d6cbb8" }}
          >
            <X className="w-4 h-4" style={{ color: "#2d4a3e" }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Source */}
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" style={{ color: "#7d6b8a" }} />
            <span className="text-xs font-medium" style={{ color: "#7d6b8a" }}>
              Source
            </span>
            <span
              className="ml-auto text-xs font-semibold px-3 py-1 rounded-full border capitalize"
              style={{
                backgroundColor: sc.bg,
                color: sc.text,
                borderColor: sc.border,
              }}
            >
              {inquiry.source}
            </span>
          </div>

          <hr style={{ borderColor: "#d6cbb8" }} />

          {/* Contact details */}
          <div className="space-y-3">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#7d6b8a" }}
            >
              Contact Details
            </p>
            <div
              className="rounded-2xl p-4 space-y-3 border"
              style={{ backgroundColor: "#fff", borderColor: "#d6cbb8" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#2d4a3e11" }}
                >
                  <Phone className="w-3.5 h-3.5" style={{ color: "#2d4a3e" }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#7d6b8a" }}>
                    Phone
                  </p>
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: "#2d4a3e" }}
                  >
                    {inquiry.phone}
                  </a>
                </div>
              </div>

              {inquiry.email && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#6b9e6b11" }}
                  >
                    <Mail
                      className="w-3.5 h-3.5"
                      style={{ color: "#6b9e6b" }}
                    />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#7d6b8a" }}>
                      Email
                    </p>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="text-sm font-semibold hover:underline"
                      style={{ color: "#2d4a3e" }}
                    >
                      {inquiry.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare
                className="w-3.5 h-3.5"
                style={{ color: "#7d6b8a" }}
              />
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#7d6b8a" }}
              >
                Message
              </p>
            </div>
            <div
              className="rounded-2xl p-5 border leading-relaxed text-sm"
              style={{
                backgroundColor: "#fff",
                borderColor: "#d6cbb8",
                color: "#2d4a3e",
                whiteSpace: "pre-wrap",
              }}
            >
              {inquiry.message}
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 pt-1">
            <Calendar className="w-3.5 h-3.5" style={{ color: "#7d6b8a" }} />
            <p className="text-xs" style={{ color: "#7d6b8a" }}>
              Received: {formatDate(inquiry.created_at)}
            </p>
          </div>

          {/* ID reference */}
          <div
            className="rounded-xl px-4 py-2.5 border"
            style={{ backgroundColor: "#f4f1ec", borderColor: "#d6cbb8" }}
          >
            <p className="text-xs font-mono" style={{ color: "#7d6b8a" }}>
              ID: {inquiry.id}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex gap-3"
          style={{ borderColor: "#d6cbb8", backgroundColor: "#fff" }}
        >
          {!inquiry.is_read && (
            <button
              onClick={() => onMarkRead(inquiry.id)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#2d4a3e", color: "#fff" }}
            >
              Mark as Read
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 hover:opacity-80"
            style={{ borderColor: "#d6cbb8", color: "#2d4a3e" }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
