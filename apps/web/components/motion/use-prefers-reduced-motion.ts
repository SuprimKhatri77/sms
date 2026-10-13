"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * The user's reduced-motion setting, safe to branch markup on. motion's own
 * useReducedMotion reads the setting during the first client render, which
 * makes server and client HTML disagree; this one renders `serverValue`
 * until hydration is done, then switches to the real setting.
 */
export function usePrefersReducedMotion(serverValue: boolean) {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
