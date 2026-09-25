import { siteConfig } from "@/config/site.config";
import { telHref } from "@/lib/format";

/**
 * Where every "Book" button goes. One function, so the switch on the admin
 * dashboard changes every CTA on the site at once — no hunt through components.
 *
 * `enabled` comes from the `online_booking_enabled` setting: server
 * components read it with `isOnlineBookingEnabled()` (lib/booking-settings),
 * client components get it from `useBookingAction()` (BookingProvider).
 */
export type BookingAction = {
  href: string;
  label: string;
  /** Screen-reader label; says what will actually happen on tap. */
  ariaLabel: string;
  external: boolean;
  online: boolean;
};

export function getBookingAction(enabled: boolean): BookingAction {
  if (enabled) {
    return { href: "/book", label: "Book online", ariaLabel: "Book an appointment online", external: false, online: true };
  }
  return {
    href: telHref,
    label: "Call to book",
    ariaLabel: `Call ${siteConfig.name} to book at ${siteConfig.phone.display}`,
    external: true,
    online: false,
  };
}
