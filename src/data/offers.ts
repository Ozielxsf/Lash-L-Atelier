/**
 * The new-client welcome offer, from the flyer and brochure.
 *
 * ⚠️ How it is redeemed online is an assumption until the owner confirms it:
 * print says "present this brochure at your appointment"; the site asks the
 * client to mention it when booking. Logged in CLAUDE.md → client decisions.
 */
export const WELCOME_OFFER = {
  amount: 25,
  headline: "Off your first visit",
  eyebrow: "New client special",
  howTo: "Mention this offer when you book.",
  fineprint: "For new clients. One welcome offer per client.",
} as const;
