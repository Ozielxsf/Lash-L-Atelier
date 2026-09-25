/**
 * The four lash looks, for the "Choose your look" selector on the home page.
 *
 * Prices are NOT typed here — each look points at its full-set and fill
 * service ids in data/services.ts, so the selector can't drift from the menu.
 *
 * `fan` drives the illustration in components/home/LashDiagram.tsx: how many
 * extensions sit on each natural lash, and how fine they are drawn. It is a
 * visual shorthand for density, not a technical spec the studio promises.
 */

export type LashStyle = {
  id: "classic" | "hybrid" | "volume" | "mega";
  name: string;
  /** The look in the brand's voice. */
  mood: string;
  description: string;
  bestFor: string;
  fullSetId: string;
  fillId: string;
  fan: { min: number; max: number; weight: number };
};

export const LASH_STYLES: LashStyle[] = [
  {
    id: "classic",
    name: "Classic",
    mood: "Le Naturel",
    description:
      "One extension on each natural lash. Clean, defined and quietly polished — like mascara on its very best day.",
    bestFor: "Everyday definition and a first set",
    fullSetId: "classic-full-set",
    fillId: "classic-fill",
    fan: { min: 1, max: 1, weight: 2.1 },
  },
  {
    id: "hybrid",
    name: "Hybrid",
    mood: "Le Mélange",
    description:
      "Classic singles woven with soft, airy fans. More texture and a little wisp, still unmistakably you.",
    bestFor: "Softly fuller, with texture",
    fullSetId: "hybrid-full-set",
    fillId: "hybrid-fill",
    fan: { min: 1, max: 3, weight: 1.6 },
  },
  {
    id: "volume",
    name: "Volume",
    mood: "Le Volume",
    description:
      "Hand-made fans of ultra-fine lashes on every natural lash — fuller, darker and plush without feeling heavy.",
    bestFor: "A full, fluffy, dark line",
    fullSetId: "volume-full-set",
    fillId: "volume-fill",
    fan: { min: 4, max: 5, weight: 1.05 },
  },
  {
    id: "mega",
    name: "Mega Volume",
    mood: "Le Grand Soir",
    description:
      "Dense fans of the finest lashes for the most dramatic line we make. The full evening look, every day.",
    bestFor: "Maximum drama and density",
    fullSetId: "mega-volume-full-set",
    fillId: "mega-volume-fill",
    fan: { min: 7, max: 9, weight: 0.7 },
  },
];
