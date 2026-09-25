import { features } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";
import { telHref } from "@/lib/format";

/**
 * Where every "Book" button goes. One function, so switching to online
 * booking is `features.onlineBooking = true` — not a hunt through every CTA.
 */
export type BookingAction = {
  href: string;
  label: string;
  /** Screen-reader label; says what will actually happen on tap. */
  ariaLabel: string;
  external: boolean;
};

export function getBookingAction(): BookingAction {
  if (features.onlineBooking) {
    return { href: "/book", label: "Book online", ariaLabel: "Book an appointment online", external: false };
  }
  return {
    href: telHref,
    label: "Call to book",
    ariaLabel: `Call ${siteConfig.name} to book at ${siteConfig.phone.display}`,
    external: true,
  };
}
