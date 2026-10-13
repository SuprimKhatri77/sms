"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SignOutIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react/ssr";
import type { JWTUser } from "@repo/types";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function UserAvatar({
  user,
  className,
}: {
  user: Pick<JWTUser, "name" | "imageUrl">;
  className?: string;
}) {
  if (user.imageUrl) {
    return (
      <Image
        src={user.imageUrl}
        alt=""
        width={36}
        height={36}
        className={cn("size-9 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-pine font-label text-[0.7rem] tracking-[0.06em] text-paper select-none",
        className,
      )}
    >
      {getInitials(user.name)}
    </span>
  );
}

const itemClass =
  "flex w-full items-center gap-3 px-4 py-3 text-left text-[0.8125rem] text-ink-muted outline-none transition-colors hover:bg-surface hover:text-ink focus-visible:bg-surface focus-visible:text-ink disabled:cursor-not-allowed disabled:opacity-50";

/** Avatar button with a small account popover (dashboard, logout). */
export function UserMenu({
  user,
  dashboardHref,
  onLogout,
  isLoggingOut,
}: {
  user: JWTUser;
  dashboardHref: string;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    // Move focus into the menu so keyboard users land on its first action.
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={cn(
          "flex rounded-full outline-none ring-offset-2 ring-offset-paper transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-clay/60",
          open && "ring-2 ring-clay/50",
        )}
      >
        <UserAvatar user={user} />
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          className="animate-rise absolute right-0 top-[calc(100%+12px)] z-50 w-60 border border-hairline bg-paper shadow-[0_30px_60px_-30px_rgb(26_26_26/0.35)]"
        >
          <div className="border-b border-hairline px-4 py-3.5">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            {user.email ? (
              <p className="truncate text-xs text-ink-muted">{user.email}</p>
            ) : null}
          </div>
          <Link
            href={dashboardHref}
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <SquaresFourIcon weight="light" className="size-4 shrink-0" />
            Dashboard
          </Link>
          <button
            type="button"
            // Stays open showing progress; it unmounts once the user clears.
            onClick={onLogout}
            disabled={isLoggingOut}
            className={cn(itemClass, "border-t border-hairline")}
          >
            {isLoggingOut ? (
              <Spinner />
            ) : (
              <SignOutIcon weight="light" className="size-4 shrink-0" />
            )}
            {isLoggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
