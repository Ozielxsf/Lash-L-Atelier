/**
 * Motion tokens. The brand's motion personality is "a slow Parisian evening":
 * long, soft decelerations, nothing that snaps. Components read these rather
 * than hard-coding numbers, so the whole site's pace can be tuned here.
 *
 * Keep EASE in sync with --ease-soir in globals.css.
 */
export const motionTokens = {
  ease: [0.22, 0.61, 0.19, 1] as const,
  reveal: { duration: 1.05, distance: 28, stagger: 0.09 },
  /** Lenis smooth-scroll duration. Longer = more languid. */
  scrollDuration: 1.15,
} as const;
