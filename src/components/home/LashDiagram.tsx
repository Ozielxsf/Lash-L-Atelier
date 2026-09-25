"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useMemo } from "react";
import type { LashStyle } from "@/data/lash-styles";

/*
 * A closed eye drawn the way lash artists sketch a lash map: the lid as one
 * curve, extensions fanning out beneath it. Generated rather than drawn by
 * hand so each style is honest about the difference — one lash per point for
 * Classic, mixed singles and fans for Hybrid, dense fine fans for Volume and
 * Mega. Lashes lengthen toward the outer corner, as a real set is mapped.
 */

const W = 320;
const H = 200;
// The lid: a shallow U from inner to outer corner.
const P0 = { x: 34, y: 58 };
const P1 = { x: 150, y: 150 };
const P2 = { x: 292, y: 50 };
const POINTS = 24;

type Vec = { x: number; y: number };

function bezier(t: number): Vec {
  const u = 1 - t;
  return {
    x: u * u * P0.x + 2 * u * t * P1.x + t * t * P2.x,
    y: u * u * P0.y + 2 * u * t * P1.y + t * t * P2.y,
  };
}

function tangent(t: number): Vec {
  const x = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
  const y = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
  const len = Math.hypot(x, y);
  return { x: x / len, y: y / len };
}

function rotate(v: Vec, deg: number): Vec {
  const r = (deg * Math.PI) / 180;
  return { x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r) };
}

/** Extensions on the natural lash at index i. Deterministic — no flicker between renders. */
function fanSize(style: LashStyle, i: number): number {
  const { min, max } = style.fan;
  if (min === max) return min;
  if (style.id === "hybrid") return i % 2 === 0 ? 1 : i % 4 === 1 ? 2 : 3;
  return min + ((i * 7) % (max - min + 1));
}

function buildLashes(style: LashStyle) {
  const paths: string[] = [];
  const spread = style.id === "mega" ? 3.2 : style.id === "volume" ? 5 : 6;
  for (let i = 0; i < POINTS; i++) {
    const t = 0.05 + (0.9 * i) / (POINTS - 1);
    const b = bezier(t);
    const tan = tangent(t);
    // Outward normal: pointing away from the lid, i.e. down and out.
    const n = { x: -tan.y, y: tan.x };
    // Shorter at the inner corner, longest just before the outer corner.
    let len = 30 + 50 * Math.pow(t, 0.85);
    if (t > 0.86) len *= 1 - (t - 0.86) * 1.6;
    const k = fanSize(style, i);
    for (let j = 0; j < k; j++) {
      const d = rotate(n, (j - (k - 1) / 2) * spread);
      const l = len * (1 - Math.abs(j - (k - 1) / 2) * 0.035);
      const c = { x: b.x + d.x * l * 0.55, y: b.y + d.y * l * 0.55 };
      // The curl: the tip lifts back toward the lid, like a C-curl extension.
      const e = { x: b.x + d.x * l * 0.92 - n.x * l * 0.3, y: b.y + d.y * l * 0.92 - n.y * l * 0.3 };
      paths.push(`M${b.x.toFixed(1)} ${b.y.toFixed(1)} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${e.x.toFixed(1)} ${e.y.toFixed(1)}`);
    }
  }
  return paths;
}

export default function LashDiagram({ style }: { style: LashStyle }) {
  const reduce = useReducedMotion();
  // useId can contain characters that break a url(#…) reference; keep it plain.
  const shadeId = `lid-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const paths = useMemo(() => buildLashes(style), [style]);
  const lid = `M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Illustration of a ${style.name} lash set`} className="h-auto w-full">
      {/* The lid, softly shaded like a closed eye. */}
      <defs>
        <linearGradient id={shadeId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--color-rouge)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--color-rouge)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${lid} Q${P2.x - 20} 8 160 4 Q${P0.x + 16} 8 ${P0.x} ${P0.y} Z`} fill={`url(#${shadeId})`} />
      <g key={style.id} className="stroke-ink" fill="none" strokeLinecap="round">
        {paths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            strokeWidth={style.fan.weight}
            strokeOpacity={style.fan.max > 3 ? 0.78 : 0.92}
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : (i / paths.length) * 0.55, ease: [0.22, 0.61, 0.19, 1] }}
          />
        ))}
      </g>
      <path d={lid} fill="none" className="stroke-rouge" strokeWidth={2.4} strokeLinecap="round" />
    </svg>
  );
}
