import { getImageProps } from "next/image";
import { ArrowRight, Phone } from "lucide-react";
import OrnateFrame from "@/components/brand/OrnateFrame";
import Sparkle from "@/components/brand/Sparkle";
import Wordmark from "@/components/brand/Wordmark";
import ButtonLink from "@/components/ui/ButtonLink";
import { siteConfig } from "@/config/site.config";
import { WELCOME_OFFER } from "@/data/offers";
import { getBookingAction } from "@/lib/booking";
import heroTall from "../../../public/brand/hero-eiffel-tall.webp";
import heroWide from "../../../public/brand/hero-eiffel-wide.webp";

/**
 * The hero is a full-bleed painting of the client's world at night: a
 * glitter-black sky, the Eiffel Tower lit gold at the end of a rain-wet
 * street, gas lamps, the striped café awning and roses — generated for this
 * site (Higgsfield, Sept 2026) in the palette of their print pieces, with no
 * lettering so the typeset wordmark owns the sky.
 *
 * Two crops, art-directed with <picture>:
 *  - tall (portrait screens): tower dead-centre down the street. The name sits
 *    in the open sky above the spire; the actions sit on the lit cobblestones.
 *  - wide (landscape screens): tower on the right, open sky on the left for
 *    the name and actions — a left-aligned composition from `lg` up.
 *
 * The painting is the LCP element, so it is eager + high fetch priority.
 *
 * ⚠️ Performance: the painting is deliberately STATIC, and nothing over it
 * uses backdrop-filter. A slow scale animation on it plus frosted-glass
 * buttons and bars forced a full-screen repaint every frame and made the
 * first scroll out of the hero hitch (measured 117ms frames on a throttled
 * phone). The sparkle canvas carries the life instead.
 */
export default function Hero() {
  const booking = getBookingAction();

  const common = { alt: "", sizes: "100vw" } as const;
  const {
    props: { srcSet: wideSrcSet },
  } = getImageProps({ ...common, src: heroWide });
  const {
    props: { srcSet: tallSrcSet, ...img },
  } = getImageProps({ ...common, src: heroTall, loading: "eager", fetchPriority: "high" });

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-noir">
      {/* The painting */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <picture>
          <source media="(min-aspect-ratio: 1/1)" srcSet={wideSrcSet} />
          {/* eslint-disable-next-line jsx-a11y/alt-text -- alt="" comes from getImageProps; decorative */}
          <img
            {...img}
            className="absolute inset-0 h-full w-full object-cover object-[50%_62%] [@media(min-aspect-ratio:1/1)]:object-[60%_60%]"
          />
        </picture>

        {/* Scrims — shaped to the composition rather than a flat wash, so the
            tower and the lamps keep their glow. */}
        <div className="absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-noir/85 via-noir/45 to-transparent lg:h-full lg:w-[62%] lg:bg-gradient-to-r lg:from-noir/85 lg:via-noir/50" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-noir via-noir/70 to-transparent lg:h-[30%]" />
        <Sparkle density={0.55} seed={3} className="opacity-80" />
      </div>

      <OrnateFrame className="text-rose/40" inset="inset-3 top-[76px] sm:inset-5 sm:top-[84px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-[104px] pb-[calc(6.25rem+env(safe-area-inset-bottom))] text-center sm:px-10 lg:justify-center lg:pt-28 lg:pb-24 lg:text-left">
        {/* In the sky */}
        <div className="relative flex flex-col items-center lg:max-w-[34rem] lg:items-start">
          {/* A pool of night sky behind the name: on portrait screens the spire
              rises straight through the lockup, and this lets its tip fade into
              the dark instead of striking through the lettering. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-10 -top-6 -bottom-10 -z-10 bg-[radial-gradient(closest-side,rgb(17_10_15/0.82),rgb(17_10_15/0.55)_55%,transparent)] lg:hidden"
          />
          <p className="rise-in font-caps text-[0.68rem] font-semibold tracking-[0.34em] text-creme/85 uppercase">
            Hickory <span className="text-rose">✦</span> Pennsylvania
          </p>

          <h1 id="hero-title" className="mt-4 lg:mt-8">
            <Wordmark size="hero" animate />
            <span className="sr-only"> — lash extensions, brows and facials in Hickory, Pennsylvania</span>
          </h1>

          <p
            className="rise-in mt-5 hidden max-w-md font-display text-2xl leading-snug text-balance text-creme italic lg:block"
            style={{ "--d": "0.55s" } as React.CSSProperties}
          >
            {siteConfig.descriptor}.
          </p>
        </div>

        {/* On the street (phone) — the tower keeps the middle of the screen. */}
        <div className="mt-auto flex flex-col items-center lg:mt-9 lg:max-w-[34rem] lg:items-start">
          <p
            className="rise-in max-w-[20rem] font-display text-[1.3rem] leading-snug text-balance text-creme italic [text-shadow:0_2px_18px_rgb(17_10_15/0.9)] lg:hidden"
            style={{ "--d": "0.55s" } as React.CSSProperties}
          >
            {siteConfig.descriptor}.
          </p>

          <div
            className="rise-in mt-5 grid w-full max-w-sm grid-cols-2 gap-3 lg:mt-0 lg:flex lg:max-w-none lg:gap-4"
            style={{ "--d": "0.7s" } as React.CSSProperties}
          >
            <ButtonLink
              href={booking.href}
              ariaLabel={booking.ariaLabel}
              variant="rose"
              className="px-3 tracking-[0.14em] whitespace-nowrap sm:px-6 lg:px-8 lg:tracking-[0.2em]"
              icon={<Phone className="h-4 w-4" aria-hidden="true" />}
            >
              {booking.label}
            </ButtonLink>
            <ButtonLink href="/services" variant="outline-dark" className="bg-noir/70 px-3 tracking-[0.14em] whitespace-nowrap sm:px-6 lg:px-8 lg:tracking-[0.2em]">
              The menu
            </ButtonLink>
          </div>

          <a
            href="#welcome"
            className="rise-in group mt-4 inline-flex items-center gap-2 rounded-full border border-gaslight/45 bg-noir/80 px-4 py-2 text-[0.8rem] text-gaslight transition-colors hover:border-gaslight lg:mt-6"
            style={{ "--d": "0.85s" } as React.CSSProperties}
          >
            <span className="font-display text-base font-semibold italic">${WELCOME_OFFER.amount} off</span>
            <span className="text-creme/90">your first visit</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
