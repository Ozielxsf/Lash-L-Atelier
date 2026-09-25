/**
 * Feature flags (WALLINK_STACK.md → per-client configuration).
 *
 * The roadmap for this client is online booking, then an admin dashboard,
 * then online product ordering. Each arrives behind a flag so it can ship
 * dark, be checked on a preview, and switch on with a one-line change.
 *
 * While `onlineBooking` is false every "Book" button on the site calls the
 * studio — which is how Lash L'Atelier books today. Flip it and those same
 * buttons route to /book with no other edits (see lib/booking.ts).
 */
export const features = {
  onlineBooking: false,
  onlineShop: false,
  adminDashboard: false,
} as const;
