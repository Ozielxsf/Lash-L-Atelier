/**
 * The new-client welcome offer, from the flyer and brochure.
 *
 * Redeemed in person: the client tells the studio at their first visit
 * (Oziel, Sept 2026 — replaced the booking-form checkbox). Print says
 * "present this brochure at your appointment", which fits the same way.
 */
export const WELCOME_OFFER = {
  amount: 25,
  headline: "Off your first visit",
  eyebrow: "New client special",
  /** Under the "$25 off your first visit" headline, and in the FAQ. */
  howTo: "Just let us know when you come in — no code, no coupon.",
  /** The statement on the booking form (replaced a "first visit" checkbox). */
  bookingNote: "First visit? Let us know when you come in and we’ll take $25 off!",
  fineprint: "For new clients. One welcome offer per client.",
} as const;
