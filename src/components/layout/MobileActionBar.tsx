import Link from "next/link";
import { MapPin, Phone, ScrollText } from "lucide-react";
import { getBookingAction } from "@/lib/booking";
import { directionsHref } from "@/lib/format";

/**
 * Phone-first: the three things a visitor on a phone actually came to do —
 * book, find the studio, see the prices — always one thumb-tap away at the
 * bottom of the screen. Hidden from `lg` up, where the header carries them.
 *
 * Sits on the safe-area inset so it clears the iPhone home indicator. The
 * footer pads itself by the bar's height so nothing is ever hidden behind it.
 */
export default function MobileActionBar() {
  const booking = getBookingAction();
  const secondary =
    "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl text-[0.62rem] font-medium tracking-[0.16em] text-creme/85 uppercase transition-colors active:bg-creme/10";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line-dark bg-noir/[0.97] px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:hidden">
      <nav aria-label="Quick actions" className="mx-auto grid max-w-md grid-cols-[1fr_1fr_2fr] gap-2">
        <Link href="/services" className={secondary}>
          <ScrollText className="h-5 w-5 text-rose" strokeWidth={1.5} aria-hidden="true" />
          Menu
        </Link>
        <a href={directionsHref} target="_blank" rel="noopener noreferrer" className={secondary}>
          <MapPin className="h-5 w-5 text-rose" strokeWidth={1.5} aria-hidden="true" />
          Directions
        </a>
        <a
          href={booking.href}
          aria-label={booking.ariaLabel}
          className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-rose text-[0.78rem] font-semibold tracking-[0.18em] text-noir uppercase shadow-[0_8px_30px_-8px_rgb(242_167_198/0.7)] transition-transform active:scale-[0.97]"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {booking.label}
        </a>
      </nav>
    </div>
  );
}
