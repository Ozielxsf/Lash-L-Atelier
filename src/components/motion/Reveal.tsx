"use client";

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
 */
export default function Reveal({ children, className, delay = 0, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const El = elements[as] as typeof motion.div;
  const { duration, distance } = motionTokens.reveal;

  return (
    <El
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0.2 : duration, delay, ease: motionTokens.ease }}
    >
      {children}
    </El>
  );
}
