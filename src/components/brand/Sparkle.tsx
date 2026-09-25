"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Star = {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  color: string;
};

// The four colours of the client's glitter: script pink, blush, crème, lamplight.
const COLORS = ["242,167,198", "248,207,224", "246,234,223", "230,189,120"];

/** Seeded so the constellation is identical on every visit — composed, not random noise. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draw one glint (halo + four-point star) at full opacity into a small
 * offscreen canvas. Done once per colour; every frame after that is a cheap
 * drawImage with globalAlpha — building radial gradients per star per frame
 * was measurable scroll jank on phones.
 */
const SPRITE = 64; // px, drawn at r = SPRITE / 8
function makeSprite(color: string, dpr: number): HTMLCanvasElement {
  const size = Math.round(SPRITE * dpr);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  const x = SPRITE / 2;
  const r = SPRITE / 8;
  const g = ctx.createRadialGradient(x, x, 0, x, x, r * 3.2);
  g.addColorStop(0, `rgba(${color},0.55)`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, x, r * 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgb(${color})`;
  ctx.beginPath();
  const w = r * 0.22;
  ctx.moveTo(x, x - r * 2.2);
  ctx.quadraticCurveTo(x + w, x - w, x + r * 2.2, x);
  ctx.quadraticCurveTo(x + w, x + w, x, x + r * 2.2);
  ctx.quadraticCurveTo(x - w, x + w, x - r * 2.2, x);
  ctx.quadraticCurveTo(x - w, x - w, x, x - r * 2.2);
  ctx.fill();
  return c;
}

/**
 * Twinkling four-point stars over a night-sky surface.
 *
 * Budget-conscious by design (WALLINK_STACK performance budget): one canvas,
 * ~60 stars at most, capped at ~30fps, paused whenever it is off screen or the
 * tab is hidden, and drawn once — perfectly still — under reduced motion.
 * Purely decorative: aria-hidden, no pointer events.
 */
export default function Sparkle({
  className,
  density = 1,
  seed = 7,
}: {
  className?: string;
  /** Multiplier on star count. */
  density?: number;
  seed?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let sprites: Record<string, HTMLCanvasElement> = {};
    let raf = 0;
    let visible = false;
    let last = 0;
    let w = 0;
    let h = 0;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sprites = Object.fromEntries(COLORS.map((c) => [c, makeSprite(c, dpr)]));
      const rand = mulberry32(seed);
      const count = Math.min(60, Math.round(((w * h) / 11000) * density));
      stars = Array.from({ length: count }, () => ({
        x: rand() * w,
        // Weighted toward the top: the sky is starriest overhead.
        y: Math.pow(rand(), 1.4) * h,
        r: 0.6 + Math.pow(rand(), 3) * 2.4,
        phase: rand() * Math.PI * 2,
        speed: 0.4 + rand() * 0.9,
        color: COLORS[Math.floor(rand() * COLORS.length)],
      }));
    };

    const frame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduce ? 0.75 : 0.25 + 0.75 * Math.pow((Math.sin((t / 1000) * s.speed + s.phase) + 1) / 2, 2);
        // The sprite is drawn at r = SPRITE/8, so scale to this star's radius.
        const size = (SPRITE * s.r) / (SPRITE / 8);
        ctx.globalAlpha = a;
        ctx.drawImage(sprites[s.color], s.x - size / 2, s.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 33) return;
      last = t;
      frame(t);
    };

    const start = () => {
      if (reduce) return frame(0);
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    layout();
    frame(0);

    const ro = new ResizeObserver(() => {
      layout();
      frame(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, seed]);

  return <canvas ref={ref} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}
