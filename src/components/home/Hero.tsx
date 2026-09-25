import Image from "next/image";
import { ArrowRight, Phone } from "lucide-react";
import OrnateFrame from "@/components/brand/OrnateFrame";
import Sparkle from "@/components/brand/Sparkle";
import Wordmark from "@/components/brand/Wordmark";
import ButtonLink from "@/components/ui/ButtonLink";
import { siteConfig } from "@/config/site.config";
import { WELCOME_OFFER } from "@/data/offers";
import { getBookingAction } from "@/lib/booking";
import street from "../../../public/brand/paris-street.webp";

/**
 * The hero is the client's flyer, rebuilt live: a black sky that warms to
 * glitter-pink at the horizon, twinkling stars, the wordmark writing itself
 * in, and their own painted Paris street — Eiffel Tower, gas lamps, and the
 * Lash L'Atelier sign — rising from the bottom of the screen.
 *
 * On a phone the street is cropped toward its right side so the shop sign
 * and the lamp stay in frame; the tower returns as the screen widens.
 */
export default function Hero() {
  const booking = getBookingAction();

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-noir">
      {/* Sky */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(130%_70%_at_50%_100%,rgb(242_167_198/0.42),rgb(58_31_46/0.6)_45%,transparent_75%)]" />
        <div className="glitter-dust absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,black_55%,transparent)]" />
        <Sparkle density={1.1} seed={3} />
      </div>

      {/* The street */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-[46svh] sm:h-[52svh] lg:h-[62svh]">
        <Image
          src={street}
          alt=""
          priority
          placeholder="blur"
          sizes="100vw"
          className="h-full w-full object-cover object-[80%_100%] sm:object-[70%_100%] lg:object-center [mask-image:linear-gradient(to_bottom,transparent,black_42%)]"
        />
        {/* Deepens the foot of the image so the page flows into the next section. */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-noir to-transparent" />
      </div>

      <OrnateFrame className="text-rose/45" inset="inset-3 top-[76px] sm:inset-5 sm:top-[84px]" />

      <div className="relative flex flex-1 flex-col items-center px-6 pt-[112px] pb-[38svh] text-center sm:pb-[44svh] lg:justify-center lg:pt-24 lg:pb-[40svh]">
        <p className="rise-in font-caps text-[0.68rem] font-semibold tracking-[0.34em] text-creme/80 uppercase">
          Hickory <span className="text-rose">✦</span> Pennsylvania
        </p>

        <h1 id="hero-title" className="mt-5 lg:mt-12">
          <Wordmark size="hero" animate />
          <span className="sr-only"> — lash extensions, brows and facials in Hickory, Pennsylvania</span>
        </h1>

        <p
          className="rise-in mt-6 max-w-[22rem] font-display text-[1.3rem] leading-snug text-balance text-creme italic sm:max-w-none sm:text-2xl"
          style={{ "--d": "0.55s" } as React.CSSProperties}
        >
          {siteConfig.descriptor}.
        </p>

        <div
          className="rise-in mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
          style={{ "--d": "0.7s" } as React.CSSProperties}
        >
          <ButtonLink
            href={booking.href}
            ariaLabel={booking.ariaLabel}
            variant="rose"
            icon={<Phone className="h-4 w-4" aria-hidden="true" />}
          >
            {booking.label}
          </ButtonLink>
          <ButtonLink href="/services" variant="outline-dark">
            View the menu
          </ButtonLink>
        </div>

        <a
          href="#welcome"
          className="rise-in group mt-7 inline-flex items-center gap-2 rounded-full border border-gaslight/40 bg-noir/50 px-4 py-2 text-[0.8rem] text-gaslight backdrop-blur-sm transition-colors hover:border-gaslight"
          style={{ "--d": "0.85s" } as React.CSSProperties}
        >
          <span className="font-display text-base font-semibold italic">${WELCOME_OFFER.amount} off</span>
          <span className="text-creme/85">your first visit</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
