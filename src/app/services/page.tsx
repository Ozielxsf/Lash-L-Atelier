import type { Metadata } from "next";
import { Phone } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import CategoryNav from "@/components/services/CategoryNav";
import FaqList from "@/components/services/FaqList";
import MenuCategory from "@/components/services/MenuCategory";
import Reveal from "@/components/motion/Reveal";
import JsonLd from "@/components/seo/JsonLd";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import Flourish from "@/components/brand/Flourish";
import { FAQS } from "@/data/faqs";
import { HOUSE_RULES } from "@/data/promises";
import { MENU, RED_LIGHT, RED_LIGHT_DISCLAIMER } from "@/data/services";
import { WELCOME_OFFER } from "@/data/offers";
import { getBookingAction } from "@/lib/booking";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Menu & Prices — Lash Extensions, Brows & Facials",
  description:
    "Lash L'Atelier's full menu: classic, hybrid, volume and mega volume lash extensions and fills, brow wax, tint and lamination, organic and beef tallow facials, red light therapy and add-ons. Hickory, PA.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  const booking = getBookingAction();
  // Lashes on the left, everything else on the right — how the board reads.
  const [lashes, fills, ...rest] = MENU;

  return (
    <>
      <JsonLd data={faqSchema(FAQS)} />
      <JsonLd data={breadcrumbSchema([{ name: "Menu", path: "/services" }])} />

      <PageHeader
        french="La Carte"
        title="The Menu"
        intro={
          <>
            Every service, every price. {HOUSE_RULES.join(" · ")}.
          </>
        }
      />
      <CategoryNav />

      <div className="papier on-light py-16 sm:py-24">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-x-20">
            <div className="space-y-16">
              <MenuCategory category={lashes} />
              <MenuCategory category={fills} />
            </div>
            <div className="space-y-16">
              {rest.map((category) => (
                <MenuCategory key={category.id} category={category} />
              ))}
            </div>
          </div>

          {/* Red light — priced per plan, so it's a card rather than a price list. */}
          <Reveal className="mt-20">
            <section
              id={RED_LIGHT.id}
              aria-labelledby="red-light-menu-title"
              className="relative isolate scroll-mt-36 overflow-hidden rounded-[22px] bg-noir px-7 py-12 text-creme sm:px-14"
            >
              <div aria-hidden="true" className="red-halo absolute -top-40 -right-40 -z-10 h-[420px] w-[420px] rounded-full opacity-80" />
              <p aria-hidden="true" className="font-script text-[2.4rem] leading-none text-rose">
                {RED_LIGHT.french}
              </p>
              <h2 id="red-light-menu-title" className="mt-1 font-display text-[2.3rem] leading-tight font-medium">
                {RED_LIGHT.title}
              </h2>
              <p className="mt-2 font-display text-lg text-gaslight italic">{RED_LIGHT.priceNote}</p>
              <p className="mt-4 max-w-xl leading-relaxed text-creme-muted">{RED_LIGHT.intro}</p>
              <ul className="mt-6 grid gap-x-10 gap-y-2 sm:grid-cols-2">
                {RED_LIGHT.focuses.map((f) => (
                  <li key={f} className="flex items-center gap-3 font-display text-xl">
                    <span aria-hidden="true" className="text-rose">✦</span>
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-8 max-w-2xl text-xs leading-relaxed text-creme-muted">{RED_LIGHT_DISCLAIMER}</p>
            </section>
          </Reveal>

          {/* FAQ */}
          <section id="faq" aria-labelledby="faq-title" className="mx-auto mt-24 max-w-3xl scroll-mt-36">
            <div className="text-center">
              <p aria-hidden="true" className="font-script text-[2.4rem] leading-none text-rouge/85">
                Questions
              </p>
              <h2 id="faq-title" className="mt-1 font-display text-[2.3rem] leading-tight font-medium text-ink">
                Before your first visit
              </h2>
              <Flourish className="mx-auto mt-3 text-rouge/50" />
            </div>
            <div className="mt-10">
              <FaqList faqs={FAQS} />
            </div>
          </section>

          {/* Close */}
          <Reveal className="mt-20 text-center">
            <p className="font-display text-2xl text-ink italic">
              New here? Take <span className="nums-lining not-italic">${WELCOME_OFFER.amount}</span> off your first visit.
            </p>
            <ButtonLink
              href={booking.href}
              ariaLabel={booking.ariaLabel}
              className="mt-6"
              icon={<Phone className="h-4 w-4" aria-hidden="true" />}
            >
              {booking.label}
            </ButtonLink>
          </Reveal>
        </Container>
      </div>
    </>
  );
}
