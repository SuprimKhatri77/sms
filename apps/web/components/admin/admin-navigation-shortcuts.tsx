"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { isAdminRole } from "@/lib/auth/roles";
import { useAuthStore } from "@/store/auth";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function AdminNavigationShortcuts() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === "h" && pathname.startsWith("/admin")) {
        event.preventDefault();
        router.push("/");
        return;
      }

      if (
        key === "d" &&
        !pathname.startsWith("/admin") &&
        user &&
        isAdminRole(user.role)
      ) {
        event.preventDefault();
        router.push("/admin");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, router, user]);

  return null;
}
