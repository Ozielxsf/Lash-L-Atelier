/**
 * The service menu — "La Carte".
 *
 * Single source for every price on the site: the home page preview, the full
 * /services menu, the JSON-LD offers and /llms.txt all read from here, so a
 * price can never disagree with itself. Prices come from the client's tri-fold
 * brochure (Sept 2026).
 *
 * `id`s are stable slugs. Online booking will key appointment types off them,
 * so rename the label freely but don't change an id once booking is live.
 */

export type Service = {
  id: string;
  name: string;
  /** Whole US dollars. `null` = priced per consultation. */
  price: number | null;
  /** Small print under the name, e.g. what's included. */
  detail?: string;
};

export type ServiceCategory = {
  id: string;
  /** The English name — what people search for and what the brochure prints. */
  title: string;
  /** A French aside in the brand's voice; decorative, never the only label. */
  french: string;
  intro: string;
  note?: string;
  services: Service[];
};

export const MENU: ServiceCategory[] = [
  {
    id: "lash-extensions",
    title: "Lash Extensions",
    french: "Les Cils",
    intro:
      "A full set, applied one lash at a time. Choose the density — from a clean classic to a full-evening mega volume.",
    services: [
      { id: "classic-full-set", name: "Classic Full Set", price: 150 },
      { id: "hybrid-full-set", name: "Hybrid Full Set", price: 160 },
      { id: "volume-full-set", name: "Volume Full Set", price: 170 },
      { id: "mega-volume-full-set", name: "Mega Volume Full Set", price: 180 },
    ],
  },
  {
    id: "lash-fills",
    title: "Lash Fills",
    french: "L'Entretien",
    intro: "Keep your set full as your natural lashes shed and grow.",
    note: "Recommended every 2–3 weeks.",
    services: [
      { id: "classic-fill", name: "Classic Fill", price: 70 },
      { id: "hybrid-fill", name: "Hybrid Fill", price: 80 },
      { id: "volume-fill", name: "Volume Fill", price: 90 },
      { id: "mega-volume-fill", name: "Mega Volume Fill", price: 100 },
    ],
  },
  {
    id: "brows",
    title: "Brows & Beauty",
    french: "Les Sourcils",
    intro: "Shaped, tinted or laminated to frame the face you already have.",
    services: [
      { id: "brow-wax-shape", name: "Brow Wax & Shape", price: 25 },
      { id: "brow-wax-shape-tint", name: "Brow Wax, Shape & Tint", price: 35 },
      {
        id: "brow-lamination",
        name: "Brow Lamination",
        price: 75,
        detail: "Includes wax and shape",
      },
    ],
  },
  {
    id: "facials",
    title: "Facials",
    french: "Le Visage",
    intro: "Organic skincare, nourishing beef tallow and the glow of red light — alone or all together.",
    services: [
      { id: "organic-facial", name: "Organic Facial", price: 90 },
      { id: "beef-tallow-organic-facial", name: "Beef Tallow Organic Facial", price: 100 },
      { id: "red-light-therapy-facial", name: "Red Light Therapy Facial", price: 110 },
      {
        id: "organic-facial-red-light",
        name: "Organic Facial with Red Light Therapy",
        price: 125,
      },
      {
        id: "the-works",
        name: "“The Works”",
        price: 150,
        detail: "Organic Facial, Red Light Therapy Facial and Beef Tallow Skin Treatment",
      },
    ],
  },
  {
    id: "add-ons",
    title: "Add-On Services",
    french: "Les Petits Plaisirs",
    intro: "A little extra while you rest.",
    services: [
      { id: "eye-mask", name: "Eye Mask", price: 5 },
      { id: "lip-mask", name: "Lip Mask", price: 5 },
      { id: "eye-lip-mask", name: "Both Eye & Lip Mask", price: 8 },
    ],
  },
];

/**
 * Customised red light therapy — priced per plan, so it is its own shape
 * rather than a price list.
 *
 * Wording follows the brochure's softened version ("support", "reduction")
 * rather than the earlier menu board's ("treatment", "regeneration"). A
 * cosmetic studio shouldn't make medical-outcome claims on a public page —
 * FTC health-claim rules apply to websites as much as to ads — so keep this
 * phrasing, and keep RED_LIGHT_DISCLAIMER next to it wherever it renders.
 */
export const RED_LIGHT = {
  id: "red-light-therapy",
  title: "Customized Red Light Therapy",
  french: "La Lumière Rouge",
  intro:
    "Sessions built around your skin and your goals. We'll talk it through first and price it to your plan.",
  priceNote: "Priced to your plan",
  focuses: [
    "Acne",
    "Fine lines & wrinkles",
    "Collagen & skin rejuvenation",
    "Scalp & hair-loss support",
    "Scars, blemishes & spots",
    "Psoriasis & eczema support",
  ],
} as const;

export const RED_LIGHT_DISCLAIMER =
  "Red light therapy is a cosmetic service, not a medical treatment, and results vary from person to person. For a skin or scalp condition, please talk with your doctor as well.";

/** Lowest price in a category — for "from $X" labels. */
export function startingPrice(category: ServiceCategory): number | null {
  const prices = category.services.map((s) => s.price).filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
}

export function findService(id: string): Service | undefined {
  for (const category of MENU) {
    const hit = category.services.find((s) => s.id === id);
    if (hit) return hit;
  }
  return undefined;
}
