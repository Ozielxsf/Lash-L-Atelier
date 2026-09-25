"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { motionTokens } from "@/config/brand.config";
import { lenisInstance } from "./lenis-instance";

/**
 * Site-wide smooth scroll, tuned slow to match the brand's evening pace.
 *
 * Skipped entirely under prefers-reduced-motion — those visitors get native,
 * instant scrolling (WCAG 2.3.3), not a "gentler" version of the same effect.
 *
 * ⚠️ Any nested scroll container needs `data-lenis-prevent` (vertical) or
 * `data-lenis-prevent-horizontal` (horizontal rows), or it is dead on a phone.
 */
export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: motionTokens.scrollDuration,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      // Same-page anchors (/#atelier) glide instead of jumping, and land
      // below the fixed header.
      anchors: { offset: -84 },
    });
    lenisInstance.set(lenis);

    let id = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      lenisInstance.set(null);
    };
  }, []);

  return <>{children}</>;
}
