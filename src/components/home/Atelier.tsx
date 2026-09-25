import Flourish from "@/components/brand/Flourish";
import Reveal from "@/components/motion/Reveal";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { ATELIER } from "@/data/atelier";
import { LOYALTY, PROMISES } from "@/data/promises";
import { motionTokens } from "@/config/brand.config";

const NUMERALS = ["I", "II", "III", "IV"];

/**
 * N° 01 — what the name means and how the studio works. The first light
 * section: stepping from the night street onto the blush paper of the menu
 * board. The dictionary entry answers the question every new client has
 * ("what's an atelier?") before they have to ask it.
 */
export default function Atelier() {
  const { definition } = ATELIER;
  return (
    <section id="atelier" aria-labelledby="atelier-title" className="papier on-light relative scroll-mt-20 py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <Reveal>
            {/* A dictionary entry, set like the page of a French lexicon. */}
            <figure className="relative mx-auto max-w-sm border-y border-ink/20 py-8 text-center lg:mx-0 lg:text-left">
              <p className="font-display text-[3.4rem] leading-none font-medium text-ink italic">
                {definition.word}
              </p>
              <p className="mt-3 font-sans text-sm tracking-[0.12em] text-ink-soft">
                /{definition.say}/ <span className="mx-1 text-rouge">·</span>
                <span className="italic">{definition.part}</span>
              </p>
              <blockquote className="mt-5 font-display text-2xl leading-snug text-ink">
                “{definition.meaning}”
              </blockquote>
              <figcaption className="mt-5 font-caps text-[0.68rem] font-semibold tracking-[0.3em] text-rouge uppercase">
                The name, and the whole idea
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.1}>
            <SectionHeading
              id="atelier-title"
              number="01"
              eyebrow={ATELIER.eyebrow}
              title={ATELIER.headline}
              tone="light"
              align="left"
            />
            <div className="mt-6 max-w-xl space-y-4 text-[1.05rem] leading-relaxed text-ink-soft">
              {ATELIER.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p aria-hidden="true" className="mt-6 font-script text-4xl text-rouge">
              {ATELIER.signature}
            </p>
          </Reveal>
        </div>

        {/* A swipeable row on a phone (four stacked arches were ~1,100px of
            scrolling), a grid from sm up. One set of markup either way.
            data-lenis-prevent-horizontal or the row is dead to touch. */}
        <ul
          data-lenis-prevent-horizontal
          tabIndex={0}
          aria-label="How we work"
          className="no-scrollbar -mx-5 mt-16 flex gap-4 overflow-x-auto px-5 pt-2 pb-6 sm:mx-0 sm:mt-20 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
        >
          {PROMISES.map((promise, i) => (
            <Reveal as="li" key={promise.title} delay={i * motionTokens.reveal.stagger} className="w-[76vw] max-w-[320px] shrink-0 sm:w-auto sm:max-w-none">
              <div className="arch flex h-full flex-col items-center border border-rouge/25 bg-papier-lift/70 px-6 pt-12 pb-8 text-center shadow-soft">
                <span className="font-caps text-sm font-semibold text-rouge">{NUMERALS[i]}</span>
                <h3 className="mt-3 font-display text-[1.6rem] leading-tight font-medium text-ink">{promise.title}</h3>
                <Flourish className="mt-3 w-24 text-rouge/50" />
                <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">{promise.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-10 text-center">
          <p className="font-display text-xl text-ink italic">
            {LOYALTY.title}. <span className="text-ink-soft not-italic">{LOYALTY.body}</span>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
