"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import BookingIcon from "@/components/booking/BookingIcon";
import LashDiagram from "@/components/home/LashDiagram";
import Sparkle from "@/components/brand/Sparkle";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { LASH_STYLES } from "@/data/lash-styles";
import { findService } from "@/data/services";
import { useBookingAction } from "@/components/booking/BookingProvider";
import { formatPrice } from "@/lib/format";
import { motionTokens } from "@/config/brand.config";
import { cn } from "@/lib/utils";

/**
 * N° 03 — "Choose your look". The four lash styles are the studio's core
 * decision for a new client, and the words alone (classic / hybrid / volume)
 * mean nothing to most people. So each one is *drawn*: tap a style and the
 * lash map redraws at that density, with its full-set and fill price beside it.
 *
 * WAI-ARIA tabs pattern: arrow keys move between styles, Home/End jump.
 */
export default function LashStyles() {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const style = LASH_STYLES[index];
  const fullSet = findService(style.fullSetId);
  const fill = findService(style.fillId);
  const booking = useBookingAction();

  const select = (next: number) => {
    const i = (next + LASH_STYLES.length) % LASH_STYLES.length;
    setIndex(i);
    tabs.current[i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: LASH_STYLES.length - 1 };
    if (e.key in keys) {
      e.preventDefault();
      select(keys[e.key]);
    }
  };

  return (
    <section id="lashes" aria-labelledby="lashes-title" className="relative isolate scroll-mt-20 overflow-hidden bg-noir py-20 sm:py-28">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="glitter-dust absolute inset-0 opacity-50" />
        <Sparkle density={0.6} seed={11} />
      </div>
      <Container>
        <SectionHeading
          id="lashes-title"
          number="03"
          eyebrow="Lash Extensions"
          french="Les Cils"
          title="Choose your look."
          intro="Four densities, each placed by hand. Tap through to see the difference — then let us fit it to your eyes."
        />

        <div
          role="tablist"
          aria-label="Lash styles"
          onKeyDown={onKeyDown}
          className="mx-auto mt-10 grid max-w-xl grid-cols-4 gap-1 rounded-full border border-line-dark bg-noir-soft p-1"
        >
          {LASH_STYLES.map((s, i) => {
            const active = i === index;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`lash-tab-${s.id}`}
                aria-selected={active}
                aria-controls="lash-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => setIndex(i)}
                className={cn(
                  "relative min-h-11 rounded-full px-1 text-[0.7rem] font-medium tracking-[0.12em] uppercase transition-colors duration-300 sm:text-[0.78rem] sm:tracking-[0.18em]",
                  active ? "text-noir" : "text-creme/80 hover:text-rose",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="lash-tab-pill"
                    className="absolute inset-0 rounded-full bg-rose"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
                <span className="relative">{s.id === "mega" ? "Mega" : s.name}</span>
              </button>
            );
          })}
        </div>

        <div
          id="lash-panel"
          role="tabpanel"
          aria-labelledby={`lash-tab-${style.id}`}
          className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          {/* The lash map, on a blush card shaped like a shop window. */}
          <div className="arch papier relative mx-auto w-full max-w-md overflow-hidden px-6 pt-16 pb-6 shadow-[var(--shadow-glow-rose)] sm:px-10">
            <p className="text-center font-caps text-[0.65rem] font-semibold tracking-[0.3em] text-rouge uppercase">
              Lash map
            </p>
            <div className="mt-4">
              <LashDiagram style={style} />
            </div>
            <p className="mt-2 text-center text-xs text-ink-soft">Illustrative — your set is mapped to your eyes.</p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={style.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: motionTokens.ease }}
              className="text-center lg:text-left"
            >
              <p aria-hidden="true" className="font-script text-5xl text-rose">
                {style.mood}
              </p>
              <h3 className="mt-2 font-display text-[2.6rem] leading-none font-medium text-creme">{style.name}</h3>
              <p className="mx-auto mt-5 max-w-md text-[1.05rem] leading-relaxed text-creme-muted lg:mx-0">
                {style.description}
              </p>
              <p className="mt-4 text-sm tracking-wide text-creme">
                <span className="font-caps text-[0.68rem] font-semibold tracking-[0.26em] text-gaslight uppercase">Best for</span>
                <span className="mx-2 text-creme/40">—</span>
                {style.bestFor}
              </p>

              <dl className="mx-auto mt-8 grid max-w-sm grid-cols-2 divide-x divide-line-dark border-y border-line-dark lg:mx-0">
                <div className="py-4">
                  <dt className="font-caps text-[0.65rem] font-semibold tracking-[0.26em] text-creme-muted uppercase">Full set</dt>
                  <dd className="nums-lining mt-1 font-display text-4xl text-creme">{formatPrice(fullSet?.price ?? null)}</dd>
                </div>
                <div className="py-4">
                  <dt className="font-caps text-[0.65rem] font-semibold tracking-[0.26em] text-creme-muted uppercase">Fill</dt>
                  <dd className="nums-lining mt-1 font-display text-4xl text-creme">{formatPrice(fill?.price ?? null)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-creme-muted">Fills recommended every 2–3 weeks.</p>

              <ButtonLink
                href={booking.href}
                ariaLabel={`${booking.ariaLabel} — ${style.name} lashes`}
                variant="rose"
                className="mt-8"
                icon={<BookingIcon online={booking.online} />}
              >
                Book {style.id === "mega" ? "Mega Volume" : style.name}
              </ButtonLink>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
