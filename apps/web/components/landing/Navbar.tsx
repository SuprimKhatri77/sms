"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  X,
  Menu,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteInfo } from "@/utils/site-info";
import { useAuthStore } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { BaseAPIResponse } from "@repo/types";
import { Spinner } from "../ui/spinner";
import {
  landingContainerClass,
  landingNavLinkClass,
  landingPrimaryButtonClass,
  landingSecondaryButtonClass,
} from "./landing-styles";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Why Us", href: "/#why-us" },
  { label: "Programs", href: "/#programs" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Inquire", href: "/#inquiry" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

function UserAvatar({
  user,
  size = 36,
}: {
  user: { name: string; imageUrl?: string };
  size?: number;
}) {
  if (user.imageUrl) {
    return (
      <Image
        src={user.imageUrl}
        alt={user.name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex items-center justify-center rounded-full font-semibold text-white select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: "var(--brand-brown)",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {getInitials(user.name)}
    </span>
  );
}

function UserDropdown({
  user,
  dashboardHref,
  onClose,
  onLogout,
  isPending,
  width = "w-48",
}: {
  user: { name: string; email: string };
  dashboardHref: string;
  onClose: () => void;
  onLogout: () => void;
  isPending: boolean;
  width?: string;
}) {
  return (
    <div
      className={`absolute right-0 top-[calc(100%+10px)] z-50 ${width} overflow-hidden border border-[rgba(47,78,64,0.12)] bg-(--brand-cream) shadow-[0_8px_32px_rgba(47,78,64,0.1)]`}
      style={{ animation: "dropIn 160ms ease" }}
    >
      <div className="border-b border-[rgba(47,78,64,0.08)] px-4 py-3">
        <p
          className="truncate text-sm font-semibold text-(--brand-ink)"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {user.name}
        </p>
        <p
          className="truncate text-xs text-[rgba(26,26,26,0.42)]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {user.email}
        </p>
      </div>

      <Link
        href={dashboardHref}
        onClick={onClose}
        className="flex items-center gap-3 px-4 py-3 text-sm text-[rgba(26,26,26,0.65)] transition-colors duration-150 hover:bg-[rgba(47,78,64,0.04)] hover:text-(--brand-green)"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        <LayoutDashboard size={15} className="shrink-0" />
        Dashboard
      </Link>

      <button
        type="button"
        onClick={onLogout}
        disabled={isPending}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[rgba(26,26,26,0.65)] transition-colors duration-150 hover:bg-[rgba(47,78,64,0.04)] hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {isPending ? (
          <>
            <Spinner />
            Logging out...
          </>
        ) : (
          <>
            <LogOut size={15} className="shrink-0" />
            Logout
          </>
        )}
      </button>
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();
  const pathname = usePathname();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const { mutate, isPending, reset } = useMutation({
    mutationFn: async () => {
      const response = await api.post<BaseAPIResponse>("/auth/logout");
      return response.data;
    },
    onMutate: () => {
      setDropdownOpen(false);
    },
    onSuccess: (result) => {
      clearUser();
      toast.success(result.message);
      router.refresh();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
      reset();
    },
  });

  const dashboardHref =
    user?.role === "admin" || user?.role === "superadmin"
      ? "/admin"
      : "/dashboard";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    closeMenu();
    setDropdownOpen(false);
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const inDesktop = desktopDropdownRef.current?.contains(e.target as Node);
      const inMobile = mobileDropdownRef.current?.contains(e.target as Node);
      if (!inDesktop && !inMobile) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-100 transition-[box-shadow,background] duration-300"
      style={{
        background: scrolled
          ? "rgba(251,250,247,0.98)"
          : "rgba(251,250,247,0.94)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(47,78,64,0.1)",
        boxShadow: scrolled
          ? "0 4px 24px rgba(47,78,64,0.08)"
          : "0 1px 0 rgba(47,78,64,0.04)",
      }}
    >
      <div className="px-4 sm:px-6">
        <div
          className={cn(
            landingContainerClass,
            "flex h-16 items-center justify-between gap-3 lg:h-20",
          )}
        >
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2 no-underline transition-opacity duration-200 hover:opacity-85"
          onClick={closeMenu}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden sm:h-11 sm:w-11 lg:h-14 lg:w-14">
            <Image
              src={
                siteInfo.assets.greenBrownNoBG ?? siteInfo.assets.whiteLogoNoBG
              }
              alt={siteInfo.company.shortName}
              width={120}
              height={120}
              priority
              className="h-full w-full object-contain"
            />
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className={landingNavLinkClass}>
              {link.label}
            </Link>
          ))}

          <div className="ml-1 flex items-center gap-2.5 border-l border-[rgba(47,78,64,0.1)] pl-5">
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  className={`${landingSecondaryButtonClass} px-4 py-2 text-[0.85rem]`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className={`${landingPrimaryButtonClass} px-4 py-2 text-[0.85rem]`}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 border border-transparent p-0.5 transition-all duration-200 focus:outline-none"
                  style={{
                    outline: dropdownOpen
                      ? "2px solid rgba(194,138,79,0.45)"
                      : "2px solid transparent",
                    outlineOffset: "1px",
                  }}
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                >
                  <UserAvatar user={user} size={36} />
                </button>

                {dropdownOpen && user.email ? (
                  <UserDropdown
                    user={{ name: user.name, email: user.email }}
                    dashboardHref={dashboardHref}
                    onClose={() => setDropdownOpen(false)}
                    onLogout={() => mutate()}
                    isPending={isPending}
                  />
                ) : null}
              </div>
            )}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          {user ? (
            <div className="relative" ref={mobileDropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center transition-all duration-200 focus:outline-none"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                <UserAvatar user={user} size={34} />
              </button>

              {dropdownOpen && user.email ? (
                <UserDropdown
                  user={{ name: user.name, email: user.email }}
                  dashboardHref={dashboardHref}
                  onClose={() => {
                    setDropdownOpen(false);
                    closeMenu();
                  }}
                  onLogout={() => mutate()}
                  isPending={isPending}
                  width="w-52"
                />
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            className={cn(
              "flex h-11 w-11 items-center justify-center border transition-colors duration-200",
              menuOpen
                ? "border-(--brand-green) bg-(--brand-green) text-white"
                : "border-[rgba(47,78,64,0.14)] text-(--brand-green) hover:border-[rgba(47,78,64,0.22)] hover:bg-[rgba(47,78,64,0.04)]",
            )}
          >
            {menuOpen ? (
              <X className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
      </div>

      {/* Mobile slide-over menu */}
      <div
        className={cn(
          "fixed inset-0 z-90 lg:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          className={cn(
            "absolute inset-0 bg-[rgba(47,78,64,0.5)] transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={closeMenu}
          tabIndex={menuOpen ? 0 : -1}
        />

        <div
          id="mobile-nav-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={cn(
            "absolute right-0 top-0 flex h-[100dvh] w-full max-w-[min(100%,20rem)] flex-col border-l border-[rgba(47,78,64,0.12)] bg-(--brand-cream) shadow-[-12px_0_48px_rgba(47,78,64,0.14)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:max-w-xs",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-[rgba(47,78,64,0.08)] px-5 sm:px-6">
            <p className="font-[family-name:var(--font-playfair)] text-[1.15rem] font-bold text-(--brand-green)">
              Menu
            </p>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center border border-[rgba(47,78,64,0.12)] text-(--brand-green) transition-colors hover:bg-[rgba(47,78,64,0.04)]"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link, index) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="group flex items-center gap-3 px-3 py-3.5 transition-colors hover:bg-[rgba(47,78,64,0.04)]"
                  >
                    <span className="w-6 shrink-0 font-[family-name:var(--font-dm-sans)] text-[0.7rem] font-semibold tabular-nums text-(--brand-brown)">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-[family-name:var(--font-dm-sans)] text-[1.02rem] font-medium text-[rgba(26,26,26,0.72)] transition-colors group-hover:text-(--brand-green)">
                      {link.label}
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-[rgba(47,78,64,0.25)] transition-transform group-hover:translate-x-0.5 group-hover:text-(--brand-brown)"
                      strokeWidth={2}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="shrink-0 border-t border-[rgba(47,78,64,0.08)] bg-[#f4f1ec] px-5 py-5 sm:px-6">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-ink)">
                      {user.name}
                    </p>
                    {user.email ? (
                      <p className="truncate font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(26,26,26,0.45)]">
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Link
                  href={dashboardHref}
                  onClick={closeMenu}
                  className={`${landingPrimaryButtonClass} w-full justify-center py-3`}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => mutate()}
                  disabled={isPending}
                  className={`${landingSecondaryButtonClass} w-full justify-center py-3 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isPending ? (
                    <>
                      <Spinner />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut size={16} />
                      Logout
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <p className="font-[family-name:var(--font-dm-sans)] text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[rgba(47,78,64,0.45)]">
                  Student access
                </p>
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className={`${landingSecondaryButtonClass} w-full justify-center py-3`}
                >
                  <LogIn size={16} />
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={closeMenu}
                  className={`${landingPrimaryButtonClass} w-full justify-center py-3`}
                >
                  <UserPlus size={16} />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
