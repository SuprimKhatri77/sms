"use client";

import { domAnimation, LazyMotion, MotionConfig } from "motion/react";

/**
 * Loads the DOM animation features for `m.*` components and honours the
 * user's reduced-motion setting for every motion animation on the public
 * site.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
