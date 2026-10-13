"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ListIcon } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import type { BaseAPIResponse } from "@repo/types";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { AnnouncementBar } from "./announcement-bar";
import { siteButton } from "./button";
import { SiteLogo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { primaryNav } from "./nav-links";
import { UserMenu } from "./user-menu";

const navLink =
  "relative flex h-16 items-center px-3 text-[0.8125rem] text-ink-muted outline-none transition-colors duration-300 hover:text-ink focus-visible:text-ink after:absolute after:inset-x-3 after:bottom-[18px] after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-out-expo hover:after:scale-x-100 focus-visible:after:scale-x-100 aria-[current=page]:text-ink aria-[current=page]:after:scale-x-100";

/**
 * The public site chrome: announcement ticker, then a sticky header that sits
 * flush at the top and gains a hairline and frosted background on scroll.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOpenCount, setMenuOpenCount] = useState(0);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();
  const pathname = usePathname();

  // Close the menu when the route changes (adjusting state during render,
  // not in an effect, so there's no extra commit with a stale open menu).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const logout = useMutation({
    mutationFn: async () => {
      const response = await api.post<BaseAPIResponse>("/auth/logout");
      return response.data;
    },
    onSuccess: (result) => {
      clearUser();
      toast.success(result.message);
      router.refresh();
      logout.reset();
    },
    onError: (error) => {
      toast.error(error.message);
      logout.reset();
    },
  });

  // The sheet is lg:hidden; if the viewport grows past lg while it's open,
  // close it so its body scroll lock doesn't outlive it.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardHref =
    user?.role === "admin" || user?.role === "superadmin"
      ? "/admin"
      : "/dashboard";

  return (
    <>
      <AnnouncementBar />
      <header
        data-site-header
        className={cn(
          "sticky top-0 z-40 border-b font-site transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled
            ? "border-hairline bg-paper/85 backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-paper",
        )}
      >
        <div className="container-page grid h-(--header-h) grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <SiteLogo className="justify-self-start" />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={navLink}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-2">
            {user ? (
              <UserMenu
                user={user}
                dashboardHref={dashboardHref}
                onLogout={() => logout.mutate()}
                isLoggingOut={logout.isPending}
                // Route changes close it; keyed so its state resets.
                key={pathname}
              />
            ) : (
              <div className="hidden items-center gap-4 lg:flex">
                <Link
                  href="/auth/login"
                  className="link-underline text-[0.8125rem] text-ink outline-none"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className={siteButton({ variant: "pine", size: "sm" })}
                >
                  Sign up
                </Link>
              </div>
            )}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => {
                setMenuOpen(true);
                setMenuOpenCount((n) => n + 1);
              }}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className={cn(siteButton({ variant: "ghost", size: "icon" }), "lg:hidden")}
            >
              <ListIcon weight="light" className="size-5" />
            </button>
          </div>
        </div>
      </header>
      <MobileNav
        open={menuOpen}
        onClose={closeMenu}
        openCount={menuOpenCount}
        returnFocusRef={menuButtonRef}
        user={user}
        dashboardHref={dashboardHref}
        onLogout={() => logout.mutate()}
        isLoggingOut={logout.isPending}
      />
    </>
  );
}
