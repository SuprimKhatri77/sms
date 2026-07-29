"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { siteInfo } from "@/utils/site-info";
import { cn } from "@/lib/utils";

function toWhatsAppDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const phone = siteInfo.contact.phone;
  const whatsappHref = `https://wa.me/${toWhatsAppDigits(phone)}`;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={`${panelId}-title`}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto w-[min(100vw-2rem,20.5rem)] origin-bottom-right overflow-hidden border border-[rgba(47,78,64,0.12)] bg-(--brand-cream) shadow-[0_18px_50px_rgba(26,26,26,0.16)]"
          >
            <div className="flex items-start justify-between gap-3 bg-(--brand-green) px-4 py-3.5 text-white">
              <div className="min-w-0">
                <p
                  id={`${panelId}-title`}
                  className="font-(family-name:--font-playfair) text-[1.05rem] font-semibold leading-tight"
                >
                  Chat with us
                </p>
                <p className="mt-0.5 font-(family-name:--font-dm-sans) text-[0.78rem] text-white/75">
                  We typically reply within office hours
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-sm p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close WhatsApp chat"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>

            <div className="space-y-4 px-4 py-4">
              <p className="font-(family-name:--font-dm-sans) text-[0.9rem] leading-relaxed text-[rgba(47,78,64,0.72)]">
                Have a question about admissions or courses? Message{" "}
                {siteInfo.company.shortName} on WhatsApp.
              </p>

              <div className="border border-[rgba(47,78,64,0.1)] bg-white px-3.5 py-3">
                <p className="font-(family-name:--font-dm-sans) text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[rgba(47,78,64,0.45)]">
                  WhatsApp
                </p>
                <p className="mt-1 font-(family-name:--font-dm-sans) text-sm font-semibold text-(--brand-green)">
                  {phone}
                </p>
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2",
                  "bg-[#25D366] px-4 py-3",
                  "font-(family-name:--font-dm-sans) text-sm font-semibold text-white",
                  "transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105",
                )}
              >
                <WhatsAppIcon className="size-4.5" />
                Open WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close WhatsApp chat" : "Chat with us on WhatsApp"}
        onClick={() => setOpen((prev) => !prev)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "pointer-events-auto relative flex size-14 items-center justify-center",
          "bg-[#25D366] text-white",
          "shadow-[0_10px_28px_rgba(37,211,102,0.35)]",
          "transition-shadow duration-200 hover:shadow-[0_14px_34px_rgba(37,211,102,0.45)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand-green)",
        )}
      >
        <span className="pointer-events-none absolute inset-0 animate-ping bg-[#25D366]/30 animation-duration-[2.4s]" />
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -40 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 40 }}
              transition={{ duration: 0.15 }}
            >
              <X className="relative size-6" strokeWidth={2.25} />
            </motion.span>
          ) : (
            <motion.span
              key="wa"
              initial={{ opacity: 0, rotate: 40 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -40 }}
              transition={{ duration: 0.15 }}
            >
              <WhatsAppIcon className="relative size-7" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
