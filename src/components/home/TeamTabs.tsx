"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { TeamMember } from "@/data/team";
import { cn } from "@/lib/utils";

/**
 * One person at a time, chosen from the name pills (Oziel, Sept 2026 —
 * preferred this to a swipe row). Same tab pattern as the lash styles:
 * arrow keys / Home / End move between names.
 *
 * Every panel is rendered and stacked in one grid cell; only the chosen one
 * is visible. So the section is always as tall as the longest bio — picking
 * a name never makes the page jump — and every bio is in the HTML for
 * search and answer engines.
 */
export default function TeamTabs({ members }: { members: TeamMember[] }) {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();

  const select = (next: number) => {
    const i = (next + members.length) % members.length;
    setIndex(i);
    tabs.current[i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: members.length - 1 };
    if (e.key in keys) {
      e.preventDefault();
      select(keys[e.key]);
    }
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Our team"
        onKeyDown={onKeyDown}
        className="mx-auto mt-10 flex w-fit gap-1 rounded-full border border-line-dark bg-noir p-1"
      >
        {members.map((m, i) => {
          const active = i === index;
          return (
            <button
              key={m.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`team-tab-${m.id}`}
              aria-selected={active}
              aria-controls={`team-panel-${m.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setIndex(i)}
              className={cn(
                "relative min-h-11 rounded-full px-5 text-[0.72rem] font-medium tracking-[0.16em] uppercase transition-colors duration-300 sm:px-7 sm:text-[0.78rem]",
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

      <div className="mt-8 grid">
        {members.map((m, i) => {
          const active = i === index;
          return (
            <article
              key={m.id}
              role="tabpanel"
              id={`team-panel-${m.id}`}
              aria-labelledby={`team-tab-${m.id}`}
              inert={!active}
              className={cn(
                "grid content-start gap-6 rounded-[28px] border border-rose/20 bg-noir/70 p-6 [grid-area:1/1] sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:content-center lg:items-center lg:gap-14 lg:p-12",
                "transition-opacity duration-500 ease-soir motion-reduce:duration-0",
                active ? "opacity-100" : "pointer-events-none opacity-0",
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
          );
        })}
      </div>
    </div>
  );
}
