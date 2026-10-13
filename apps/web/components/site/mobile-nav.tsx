"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  SignOutIcon,
  SquaresFourIcon,
  XIcon,
} from "@phosphor-icons/react/ssr";
import type { JWTUser } from "@repo/types";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { siteInfo } from "@/utils/site-info";
import { siteButton } from "./button";
import { SiteLogo } from "./logo";
import { primaryNav } from "./nav-links";
import { UserAvatar } from "./user-menu";

/**
 * Full-height menu sheet for phones and tablets. Rendered outside the
 * frosted header: backdrop-filter would otherwise trap this fixed panel
 * inside the 64px bar. Closed, it is `inert`, so its links can't be tabbed to.
 */
export function MobileNav({
  open,
  onClose,
  openCount,
  returnFocusRef,
  user,
  dashboardHref,
  onLogout,
  isLoggingOut,
}: {
  open: boolean;
  onClose: () => void;
  /** Increments on every open; re-keys the list so its stagger replays. */
  openCount: number;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  user: JWTUser | null;
  dashboardHref: string;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      closeRef.current?.focus();
    } else if (wasOpen.current) {
      returnFocusRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, returnFocusRef]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 font-site lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      inert={!open}
    >
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink/30 backdrop-blur-xs transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full flex-col bg-paper transition-transform duration-500 ease-out-expo sm:max-w-sm sm:border-l sm:border-hairline",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-(--header-h) shrink-0 items-center justify-between border-b border-hairline px-4 sm:px-6">
          <SiteLogo onClick={onClose} />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={siteButton({ variant: "ghost", size: "icon" })}
          >
            <XIcon weight="light" className="size-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-4 py-8 sm:px-6">
          <p className="eyebrow mb-5">Explore</p>
          <ul key={openCount} className="space-y-1">
            {primaryNav.map((link, i) => (
              <li
                key={link.href}
                className="animate-rise"
                style={{ "--i": i } as React.CSSProperties}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="group flex items-baseline justify-between gap-4 border-b border-hairline py-3 outline-none"
                >
                  <span className="font-display text-4xl leading-tight text-ink transition-colors group-hover:text-pine group-focus-visible:text-pine">
                    {link.label}
                  </span>
                  <ArrowRightIcon
                    weight="light"
                    className="size-4 shrink-0 text-ink-muted transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 space-y-1 text-[0.8125rem] text-ink-muted">
            <p className="eyebrow mb-3">Visit us</p>
            <p>{siteInfo.contact.address}</p>
            <p>{siteInfo.contact.phone}</p>
            <p>{siteInfo.contact.officeHours}</p>
          </div>
        </nav>

        <div className="shrink-0 border-t border-hairline bg-surface px-4 py-5 sm:px-6">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} className="size-10" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                  <p className="truncate text-xs text-ink-muted">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={dashboardHref}
                  onClick={onClose}
                  className={siteButton({ variant: "pine", size: "md" })}
                >
                  <SquaresFourIcon weight="light" className="size-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className={siteButton({ variant: "outline", size: "md" })}
                >
                  {isLoggingOut ? (
                    <Spinner />
                  ) : (
                    <SignOutIcon weight="light" className="size-4" />
                  )}
                  {isLoggingOut ? "Logging out…" : "Log out"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/auth/login"
                onClick={onClose}
                className={siteButton({ variant: "outline", size: "md" })}
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                onClick={onClose}
                className={siteButton({ variant: "pine", size: "md" })}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
