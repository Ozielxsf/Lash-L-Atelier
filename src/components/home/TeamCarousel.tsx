"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { TeamMember } from "@/data/team";
import { cn } from "@/lib/utils";

/**
 * The team as a sideways portrait gallery — one person per slide, the next
 * one peeking in from the edge so it's obvious there's more. Swipe on a
 * phone; name tabs and arrows everywhere. Three people cost one screen of
 * height instead of three.
 *
 * The row is `relative` so slide offsetLefts are measured from it — without
 * that, arrows and tabs land short of their slide.
 * Native scroll-snap does the moving (fast, no JS on the scroll path); the
 * scroll listener only works out which slide is in front, for the tabs.
 * `data-lenis-prevent-horizontal`, or Lenis swallows touch swipes. On
 * desktop the row runs to the screen's right edge so the next portrait
 * peeks in naturally instead of being cut at the content column.
 */
export default function TeamCarousel({ members }: { members: TeamMember[] }) {
  const scroller = useRef<HTMLUListElement>(null);
  const slides = useRef<(HTMLLIElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    let nearest = 0;
    let best = Infinity;
    slides.current.forEach((s, i) => {
      if (!s) return;
      const d = Math.abs(s.offsetLeft - pad - el.scrollLeft);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setIndex(nearest);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const go = (i: number) => {
    const el = scroller.current;
    const s = slides.current[i];
    if (!el || !s) return;
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    el.scrollTo({ left: s.offsetLeft - pad, behavior: reduce ? "auto" : "smooth" });
  };

  const last = members.length - 1;

  return (
    <div>
      {/* Name tabs, with arrows either side. */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <ArrowButton label="Previous team member" disabled={index === 0} onClick={() => go(index - 1)}>
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </ArrowButton>
        <div className="flex gap-1 rounded-full border border-line-dark bg-noir p-1">
          {members.map((m, i) => {
            const active = i === index;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => go(i)}
                aria-current={active ? "true" : undefined}
                aria-label={`Show ${m.name}, ${m.role}`}
                className={cn(
                  "relative min-h-11 rounded-full px-4 text-[0.72rem] font-medium tracking-[0.16em] uppercase transition-colors duration-300 sm:px-6 sm:text-[0.78rem]",
                  active ? "text-noir" : "text-creme/80 hover:text-rose",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="team-tab-pill"
                    className="absolute inset-0 rounded-full bg-rose"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
                <span className="relative">{m.name}</span>
              </button>
            );
          })}
        </div>
        <ArrowButton label="Next team member" disabled={index === last} onClick={() => go(index + 1)}>
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </ArrowButton>
      </div>

      <ul
        ref={scroller}
        data-lenis-prevent-horizontal
        tabIndex={0}
        aria-label="Our team — swipe or use the arrows to meet everyone"
        className="no-scrollbar relative -mx-5 mt-8 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:scroll-px-8 sm:gap-6 sm:px-8 lg:mr-[calc(50%-50vw)]"
      >
        {members.map((m, i) => (
          <li
            key={m.id}
            ref={(el) => {
              slides.current[i] = el;
            }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${members.length}: ${m.name}`}
            className="w-[86%] shrink-0 snap-start sm:w-[72%] lg:w-[84%]"
          >
            <article
              className={cn(
                "grid h-full content-start gap-6 rounded-[28px] border border-rose/15 bg-noir/70 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:content-center lg:items-center lg:gap-14 lg:p-12",
                i === index && "border-rose/30",
              )}
            >
              <figure className="mx-auto w-full max-w-[230px] lg:max-w-sm">
                <div
                  className={cn(
                    "arch relative aspect-[4/5] overflow-hidden border border-rose/30",
                    m.featured && "shadow-[var(--shadow-glow-rose)]",
                  )}
                >
                  <Image
                    src={m.photo}
                    alt={m.alt}
                    placeholder="blur"
                    sizes="(min-width: 1024px) 384px, 230px"
                    className="h-full w-full object-cover object-[50%_20%]"
                  />
                </div>
              </figure>

              <div className="text-center lg:text-left">
                <h3 className="font-display text-3xl text-creme sm:text-4xl">{m.name}</h3>
                <p className="mt-1 font-caps text-[0.68rem] font-semibold tracking-[0.3em] text-rose uppercase">
                  {m.role}
                </p>
                <div className="mt-5 space-y-4 text-left text-[1rem] leading-relaxed text-creme-muted sm:text-[1.05rem]">
                  {m.bio.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                <p aria-hidden="true" className="mt-5 font-script text-4xl text-rose sm:text-5xl">
                  {m.name}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="hidden h-11 w-11 shrink-0 place-items-center sm:grid rounded-full border border-rose/30 text-rose transition-colors hover:bg-rose hover:text-noir disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
