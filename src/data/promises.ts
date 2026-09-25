/**
 * The studio's house rules — straight from the menu board and the brochure.
 * These are real differentiators against chain lash studios (card-on-file
 * holds, memberships), so they are said early and said plainly.
 */

export type HousePromise = { title: string; body: string };

/** The three the client prints on every piece — the ribbon under the hero. */
export const HOUSE_RULES: string[] = [
  "No card on file",
  "No membership dues",
  "Pay only when you’re served",
];

export const PROMISES: HousePromise[] = [
  {
    title: "Licensed estheticians",
    body: "Every service is performed by a licensed esthetician — trained, careful and unhurried.",
  },
  {
    title: "A beauty plan, on us",
    body: "Tell us what you’d love. We’ll tailor an individual plan for your lashes, brows and skin — free.",
  },
  {
    title: "No card to hold your spot",
    body: "We never pre-charge a credit card. Book with a phone call and a promise, the old-fashioned way.",
  },
  {
    title: "No membership, no dues",
    body: "Luxury without the subscription. Come as often as you like and pay only when you receive a service.",
  },
];

export const LOYALTY = {
  title: "Ask about our loyalty program",
  body: "Regulars are rewarded. Ask your esthetician how it works at your next visit.",
};
