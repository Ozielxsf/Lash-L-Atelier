import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Phone } from "lucide-react";
import BookingFlow from "@/components/booking/BookingFlow";
import PageHeader from "@/components/layout/PageHeader";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import { siteConfig } from "@/config/site.config";
import { addOnServices, bookableServices, bookingGroupOf } from "@/data/services";
import { WELCOME_OFFER } from "@/data/offers";
import { HOUSE_RULES } from "@/data/promises";
import { getBookingDays } from "@/lib/availability";
import { bookingAccess } from "@/lib/booking-access";
import { isOnlineBookingEnabled } from "@/lib/booking-settings";
import { telHref } from "@/lib/format";

// Per request: whether the booking form shows depends on the switch AND on
// whether the visitor is the signed-in owner previewing it.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const live = await isOnlineBookingEnabled();
  return {
    title: "Book an Appointment",
    description: `Request a lash, brow or facial appointment at ${siteConfig.name} in Hickory, PA. No card on file — pay only when you're served.`,
    alternates: { canonical: "/book" },
    // Only indexable while booking is actually open to the public.
    robots: live ? undefined : { index: false, follow: true },
  };
}

export default async function BookPage() {
  const access = await bookingAccess();

  if (!access) {
    return (
      <PageHeader
        french="Réservations"
        title="Book your visit"
        intro="We take bookings by phone — call and we’ll find a time that suits you."
      >
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={telHref} variant="rose" icon={<Phone className="h-4 w-4" aria-hidden="true" />}>
            Call {siteConfig.phone.display}
          </ButtonLink>
          <ButtonLink href="/services" variant="outline-dark">See the menu</ButtonLink>
        </div>
      </PageHeader>
    );
  }

  const days = await getBookingDays();
  const services = bookableServices().map((s) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    duration: s.duration,
    category: s.category.title,
    french: s.category.french,
    group: bookingGroupOf(s.category),
  }));
  const addOns = addOnServices().map((a) => ({ name: a.name, price: a.price }));

  return (
    <>
      <PageHeader french="Réservations" title="Book your visit" intro={`${HOUSE_RULES.join(" · ")}.`} />
      <div className="papier on-light py-12 sm:py-16">
        <Container className="max-w-3xl">
          {access === "preview" && (
            <div role="note" className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-700/30 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <Eye className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                <strong>Preview.</strong> Online booking is switched off, so only you can see this page. Requests you make here are
                marked “test”. Turn it on from the{" "}
                <Link href="/admin" className="underline underline-offset-2">dashboard</Link>.
              </p>
            </div>
          )}
          <BookingFlow
            services={services}
            days={days}
            addOns={addOns}
            phone={{ display: siteConfig.phone.display, href: telHref }}
            firstVisitNote={WELCOME_OFFER.bookingNote}
          />
        </Container>
      </div>
    </>
  );
}
