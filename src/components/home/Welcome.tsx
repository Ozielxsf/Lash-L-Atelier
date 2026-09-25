import BookingIcon from "@/components/booking/BookingIcon";
import OrnateFrame from "@/components/brand/OrnateFrame";
import Reveal from "@/components/motion/Reveal";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import { WELCOME_OFFER } from "@/data/offers";
import { getBookingAction } from "@/lib/booking";
import { isOnlineBookingEnabled } from "@/lib/booking-settings";

/**
 * N° 05 — the new-client offer as a keepsake ticket: blush card, the
 * ornamental frame from the flyer, a perforated stub. It is the one element
 * on the page designed to be screenshotted.
 */
export default async function Welcome() {
  const booking = getBookingAction(await isOnlineBookingEnabled());
  return (
    <section id="welcome" aria-labelledby="welcome-title" className="relative scroll-mt-24 bg-noir py-20 sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-3xl">
          <div className="papier on-light relative grid overflow-hidden rounded-[22px] shadow-[var(--shadow-glow-rose)] sm:grid-cols-[1fr_auto]">
            <OrnateFrame className="text-rouge/60" />
            <div className="relative px-8 pt-14 pb-10 text-center sm:py-14 sm:pl-14 sm:text-left">
              <p className="font-caps text-[0.68rem] font-semibold tracking-[0.3em] text-rouge uppercase">
                N° 05 — {WELCOME_OFFER.eyebrow}
              </p>
              <h2 id="welcome-title" className="mt-4 font-display leading-none text-ink">
                <span className="nums-lining text-[5.5rem] font-medium sm:text-[7rem]">
                  <span className="align-top text-[0.45em]">$</span>
                  {WELCOME_OFFER.amount}
                </span>
                <span className="mt-2 block text-[2rem] italic">{WELCOME_OFFER.headline}</span>
              </h2>
              <p className="mt-5 text-[1.02rem] text-ink-soft">{WELCOME_OFFER.howTo}</p>
            </div>

            {/* The stub, torn along a perforation. */}
            <div className="relative flex flex-col items-center justify-center gap-4 border-t-2 border-dashed border-rouge/30 px-8 pt-8 pb-14 sm:border-t-0 sm:border-l-2 sm:px-12 sm:py-14">
              <span aria-hidden="true" className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-noir sm:top-[-16px] sm:left-[-17px]" />
              <span aria-hidden="true" className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-noir sm:top-auto sm:right-auto sm:bottom-[-16px] sm:left-[-17px]" />
              <p aria-hidden="true" className="font-script text-4xl text-rouge">Bienvenue</p>
              <ButtonLink
                href={booking.href}
                ariaLabel={booking.ariaLabel}
                icon={<BookingIcon online={booking.online} />}
              >
                {booking.label}
              </ButtonLink>
              <p className="max-w-[14rem] text-center text-xs text-ink-soft">{WELCOME_OFFER.fineprint}</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
