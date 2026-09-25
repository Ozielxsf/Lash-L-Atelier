import type Lenis from "lenis";

/**
 * The single live Lenis instance, so things like the menu drawer can pause
 * page scrolling while they're open. `null` under reduced motion, where Lenis
 * never starts and native scrolling is used.
 */
let instance: Lenis | null = null;

export const lenisInstance = {
  get: () => instance,
  set: (next: Lenis | null) => {
    instance = next;
  },
};
