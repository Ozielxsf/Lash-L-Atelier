import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Awning from "@/components/brand/Awning";
import Flourish from "@/components/brand/Flourish";
import Reveal from "@/components/motion/Reveal";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { MENU, RED_LIGHT, startingPrice } from "@/data/services";
import { formatCurrency } from "@/lib/format";

/**
 * N° 03 — La Carte. The client's menu board, rebuilt: the striped awning,
 * an arched blush card, and every category with its starting price. The
 * whole card is a doorway to the full menu — each row links to its section.
 */
export default function MenuPreview() {
  return (
    <section id="menu" aria-labelledby="menu-title" className="relative scroll-mt-20 overflow-x-clip bg-noir pt-20 pb-24 sm:pt-28 sm:pb-32">
      <Container>
        <SectionHeading
          id="menu-title"
          number="03"
          eyebrow="The Menu"
          french="La Carte"
          title="Lashes, brows & skin — priced plainly."
          intro="No memberships, no packages you have to decode. Here’s where every service starts."
        />

        <Reveal className="relative mx-auto mt-14 max-w-2xl">
          <div className="relative px-1">
            <Awning className="relative z-10" />
          </div>
          <div className="papier on-light relative -mt-4 rounded-b-[18px] px-6 pt-12 pb-12 shadow-lift sm:px-12">
            <ul className="divide-y divide-ink/10">
              {MENU.map((category) => {
                const from = startingPrice(category);
                return (
                  <li key={category.id}>
                    <Link
                      href={`/services#${category.id}`}
                      className="group flex items-end gap-2 py-5 transition-colors"
                    >
                      <span className="flex flex-col">
                        <span aria-hidden="true" className="font-script text-2xl leading-none whitespace-nowrap text-rouge/80">
                          {category.french}
                        </span>
                        <span className="mt-1 font-display text-[1.6rem] leading-tight font-medium text-ink group-hover:text-rouge">
                          {category.title}
                        </span>
                      </span>
                      <span aria-hidden="true" className="leader text-ink" />
                      {from !== null && (
                        <span className="nums-lining shrink-0 text-right font-display text-ink">
                          <span className="block font-sans text-[0.62rem] tracking-[0.22em] text-ink-soft uppercase">from</span>
                          <span className="text-2xl">{formatCurrency(from)}</span>
                        </span>
                      )}
                      <ArrowRight className="mb-1.5 ml-1 h-4 w-4 shrink-0 text-rouge transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link href={`/services#${RED_LIGHT.id}`} className="group flex items-end gap-2 py-5">
                  <span className="flex flex-col">
                    <span aria-hidden="true" className="font-script text-2xl leading-none whitespace-nowrap text-rouge/80">
                      {RED_LIGHT.french}
                    </span>
                    <span className="mt-1 font-display text-[1.6rem] leading-tight font-medium text-ink group-hover:text-rouge">
                      Red Light
                    </span>
                  </span>
                  <span aria-hidden="true" className="leader text-ink" />
                  <span className="shrink-0 pb-0.5 font-display text-lg leading-tight text-ink italic">Priced to you</span>
                  <ArrowRight className="mb-1.5 ml-1 h-4 w-4 shrink-0 text-rouge transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            </ul>

            <div className="mt-8 flex flex-col items-center">
              <Flourish className="text-rouge/60" />
              <ButtonLink href="/services" className="mt-6">
                See the full menu
              </ButtonLink>
            </div>
          </div>

          {/* The rose cluster that sits on the corner of the client's menu board. */}
          <Image
            src="/brand/roses.webp"
            alt=""
            width={470}
            height={210}
            sizes="220px"
            className="pointer-events-none absolute -right-6 -bottom-12 w-[200px] rotate-[-8deg] drop-shadow-[0_14px_20px_rgb(17_10_15/0.45)] sm:-right-16 sm:w-[260px]"
          />
        </Reveal>
      </Container>
    </section>
  );
}
