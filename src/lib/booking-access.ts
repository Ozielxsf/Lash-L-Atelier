import "server-only";

import { isAdmin } from "@/lib/admin-auth";
import { getBookingSettings } from "@/lib/booking-settings";

/**
 * Who may use the booking flow right now:
 *  - "public"  — the switch is on; anyone.
 *  - "preview" — the switch is off but this is the signed-in owner, testing it.
 *  - null      — nobody; the site says "call to book".
 */
export async function bookingAccess(): Promise<"public" | "preview" | null> {
  const settings = await getBookingSettings();
  if (!settings.connected) return null;
  if (settings.enabled) return "public";
  return (await isAdmin()) ? "preview" : null;
}
