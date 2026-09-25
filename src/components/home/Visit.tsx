import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site.config";
import { WELCOME_OFFER } from "@/data/offers";
import { directionsHref } from "@/lib/format";
import { getBookingAction } from "@/lib/booking";
import shopfront from "../../../public/brand/atelier-shopfront.webp";

/**
 * N° 06 — Nous Trouver. The atelier's own shopfront — awning, lit arched
 * windows, roses and the hanging sign — framed in an arch like a window
 * you're about to walk up to, beside the
 * address set large enough to read at arm's length.
 */
export default function Visit({ number = "06" }: { number?: string | null }) {
  const { address, phone, hours } = siteConfig;
  const booking = getBookingAction();

  return (
    <section aria-labelledby="visit-title" className="relative bg-noir pt-4 pb-24 sm:pb-32">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="order-2 lg:order-1">
            <div className="arch relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden border border-rose/30 shadow-[var(--shadow-glow-rose)]">
              <Image
                src={shopfront}
                alt="Painted illustration of the Lash L’Atelier shopfront at dusk — a striped awning, glowing arched windows, roses and the hanging Lash L’Atelier sign beside a gas lamp"
                placeholder="blur"
                sizes="(min-width: 1024px) 384px, 90vw"
                className="h-full w-full object-cover object-[62%_40%]"
              />
            </div>
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={0.08}>
            <SectionHeading
              id="visit-title"
              number={number ?? undefined}
              eyebrow="Visit the Atelier"
              french="Nous Trouver"
              title="Come see us on Campbell Street."
              align="left"
            />
            <address className="nums-lining mt-8 font-display text-[1.9rem] leading-tight text-creme not-italic">
              {address.street}
              <br />
              {address.city}, {address.region} {address.postalCode}
            </address>
            <p className="nums-lining mt-4 flex items-center gap-2 text-creme-muted">
              <Phone className="h-4 w-4 text-rose" aria-hidden="true" />
              {phone.display}
              <span className="mx-1 text-creme/30">·</span>
              {hours ? "See hours below" : "By appointment"}
            </p>
            {hours && (
              <dl className="mt-4 space-y-1 text-creme">
                {hours.map((h) => (
                  <div key={h.days} className="flex gap-4">
                    <dt className="w-28 text-creme-muted">{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href={booking.href}
                ariaLabel={booking.ariaLabel}
                variant="rose"
                icon={<Phone className="h-4 w-4" aria-hidden="true" />}
              >
                {booking.label}
              </ButtonLink>
              <ButtonLink href={directionsHref} variant="outline-dark" icon={<MapPin className="h-4 w-4" aria-hidden="true" />}>
                Directions
              </ButtonLink>
            </div>
            <p className="mt-10 border-t border-line-dark pt-6 text-creme-muted">
              New to the atelier?{" "}
              <Link href="/#welcome" className="text-gaslight underline decoration-gaslight/40 underline-offset-4 hover:decoration-gaslight">
                Take ${WELCOME_OFFER.amount} off your first visit
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
