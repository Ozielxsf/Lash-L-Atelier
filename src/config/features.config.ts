/**
 * Build-time feature flags (WALLINK_STACK.md → per-client configuration).
 *
 * Online booking is NOT a flag here any more: it's built and deployed, and
 * the owner switches it on and off from /admin (the `online_booking_enabled`
 * setting in the database). See lib/booking-settings.ts.
 *
 * What remains here is roadmap that isn't built yet.
 */
export const features = {
  onlineShop: false,
} as const;
