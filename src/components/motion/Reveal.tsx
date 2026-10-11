"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/config/brand.config";

type As = "div" | "li" | "section" | "article" | "p" | "span" | "h2";

// Static lookup rather than motion.create(as) during render — a component
// created in render gets a new identity each time, which remounts the node
// and loses its once-only in-view state.
const elements = {
  div: motion.div,
  li: motion.li,
  section: motion.section,
  article: motion.article,
  p: motion.p,
  span: motion.span,
  h2: motion.h2,
} as const;

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Use motionTokens.reveal.stagger × index for sequences. */
  delay?: number;
  as?: As;
};

/**
 * The one reveal the whole site uses: a soft lift-and-fade as the element
 * enters the viewport. Runs once — a section already read shouldn't
 * re-animate when scrolled past again. Reduced motion → opacity only.
 *
 * ⚠️ Server HTML is always VISIBLE. Only content that starts below the fold
 * is hidden — in a layout effect, i.e. before the browser's first paint, so
 * there's no flicker — and fades in when scrolled to. Content already on
 * screen at load is simply shown. Previously everything shipped as
 * opacity:0 and waited for the JavaScript to load before appearing, which
 * made the main text of /services and /visit the slowest thing on the page
 * (Largest Contentful Paint 5.4s on a throttled phone, Oct 2026).
 */
export default function Reveal({ children, className, delay = 0, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const El = elements[as] as typeof motion.div;
  const { duration, distance } = motionTokens.reveal;
  const ref = useRef<HTMLDivElement>(null);
  const [waiting, setWaiting] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    // Below the fold at load → hide now (before paint), reveal on scroll.
    // Reading layout to decide this is the point of a layout effect.
    if (el && el.getBoundingClientRect().top > window.innerHeight) setWaiting(true);
  }, []);

  const variants = {
    hidden: { opacity: 0, y: reduce ? 0 : distance, transition: { duration: 0 } },
    shown: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : duration, delay, ease: motionTokens.ease } },
  };

  return (
    <El
      ref={ref}
      className={className}
      variants={variants}
      initial={false}
      animate={waiting ? "hidden" : undefined}
      whileInView={waiting ? "shown" : undefined}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      {children}
    </El>
  );
}
