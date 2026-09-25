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
  /**
   * Appointment length in minutes — what online booking blocks out.
   * ⚠️ ESTIMATES from typical studio times; the owner hasn't supplied real
   * ones yet. Confirm before booking goes live (CLAUDE.md → content needed).
   */
  duration?: number;
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
  /**
   * How this category takes part in online booking:
   *  - "service": each item is its own appointment type
   *  - "add-on":  optional extras added to another appointment (no extra time)
   */
  booking: "service" | "add-on";
};

export const MENU: ServiceCategory[] = [
  {
    id: "lash-extensions",
    booking: "service",
    title: "Lash Extensions",
    french: "Les Cils",
    intro:
      "A full set, applied one lash at a time. Choose the density — from a clean classic to a full-evening mega volume.",
    services: [
      { id: "classic-full-set", name: "Classic Full Set", price: 150, duration: 120 },
      { id: "hybrid-full-set", name: "Hybrid Full Set", price: 160, duration: 150 },
      { id: "volume-full-set", name: "Volume Full Set", price: 170, duration: 150 },
      { id: "mega-volume-full-set", name: "Mega Volume Full Set", price: 180, duration: 180 },
    ],
  },
  {
    id: "lash-fills",
    booking: "service",
    title: "Lash Fills",
    french: "L'Entretien",
    intro: "Keep your set full as your natural lashes shed and grow.",
    note: "Recommended every 2–3 weeks.",
    services: [
      { id: "classic-fill", name: "Classic Fill", price: 70, duration: 60 },
      { id: "hybrid-fill", name: "Hybrid Fill", price: 80, duration: 75 },
      { id: "volume-fill", name: "Volume Fill", price: 90, duration: 75 },
      { id: "mega-volume-fill", name: "Mega Volume Fill", price: 100, duration: 90 },
    ],
  },
  {
    id: "brows",
    booking: "service",
    title: "Brows & Beauty",
    french: "Les Sourcils",
    intro: "Shaped, tinted or laminated to frame the face you already have.",
    services: [
      { id: "brow-wax-shape", name: "Brow Wax & Shape", price: 25, duration: 30 },
      { id: "brow-wax-shape-tint", name: "Brow Wax, Shape & Tint", price: 35, duration: 45 },
      {
        id: "brow-lamination",
        name: "Brow Lamination",
        price: 75,
        duration: 60,
        detail: "Includes wax and shape",
      },
    ],
  },
  {
    id: "facials",
    booking: "service",
    title: "Facials",
    french: "Le Visage",
    intro: "Organic skincare, nourishing beef tallow and the glow of red light — alone or all together.",
    services: [
      { id: "organic-facial", name: "Organic Facial", price: 90, duration: 60 },
      { id: "beef-tallow-organic-facial", name: "Beef Tallow Organic Facial", price: 100, duration: 60 },
      { id: "red-light-therapy-facial", name: "Red Light Therapy Facial", price: 110, duration: 45 },
      {
        id: "organic-facial-red-light",
        name: "Organic Facial with Red Light Therapy",
        price: 125,
        duration: 75,
      },
      {
        id: "the-works",
        name: "“The Works”",
        price: 150,
        duration: 105,
        detail: "Organic Facial, Red Light Therapy Facial and Beef Tallow Skin Treatment",
      },
    ],
  },
  {
    id: "add-ons",
    booking: "add-on",
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

/** Every service that can be booked online on its own, with its category. */
export function bookableServices(): (Service & { duration: number; category: ServiceCategory })[] {
  return MENU.filter((c) => c.booking === "service").flatMap((category) =>
    category.services
      .filter((s): s is Service & { duration: number } => typeof s.duration === "number")
      .map((s) => ({ ...s, category })),
  );
}

export function findBookableService(id: string) {
  return bookableServices().find((s) => s.id === id);
}

export function addOnServices(): Service[] {
  return MENU.filter((c) => c.booking === "add-on").flatMap((c) => c.services);
}

export function findService(id: string): Service | undefined {
  for (const category of MENU) {
    const hit = category.services.find((s) => s.id === id);
    if (hit) return hit;
  }
  return undefined;
}
