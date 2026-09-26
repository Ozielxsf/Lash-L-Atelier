import Image from "next/image";
import Flourish from "@/components/brand/Flourish";
import Reveal from "@/components/motion/Reveal";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { TEAM, TEAM_SECTION } from "@/data/team";
import { motionTokens } from "@/config/brand.config";

/**
 * N° 02 — Meet the Team. After "what an atelier is" comes who works in it.
 * The owner's portrait sits in the same arched window as the shopfront, beside
 * a note in her own words, signed in script like a letter. The rest of the
 * team follows as smaller arched portraits — the row appears as soon as a
 * second person is added to src/data/team.ts.
 */
export default function Team() {
  const owner = TEAM.find((m) => m.featured) ?? TEAM[0];
  const others = TEAM.filter((m) => m !== owner);
  if (!owner) return null;

  return (
    <section id="about" aria-labelledby="about-title" className="relative scroll-mt-20 bg-noir-soft py-20 sm:py-28">
      <Container>
        {/* Phone: heading, portrait, words. Desktop: portrait beside both. */}
        <div className="grid gap-x-20 gap-y-10 [grid-template-areas:'head'_'photo'_'bio'] lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-y-0 lg:[grid-template-areas:'photo_top'_'photo_head'_'photo_bio'_'photo_rest']">
          <Reveal className="self-center [grid-area:photo]">
            <figure className="mx-auto w-full max-w-sm">
              <div className="arch relative aspect-[4/5] overflow-hidden border border-rose/30 shadow-[var(--shadow-glow-rose)]">
                <Image
                  src={owner.photo}
                  alt={owner.alt}
                  placeholder="blur"
                  sizes="(min-width: 1024px) 384px, 90vw"
                  className="h-full w-full object-cover object-[50%_20%]"
                />
              </div>
              <figcaption className="mt-5 text-center">
                <span className="block font-display text-2xl text-creme">{owner.name}</span>
                <span className="mt-1 block font-caps text-[0.68rem] font-semibold tracking-[0.3em] text-rose uppercase">
                  {owner.role}
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.08} className="[grid-area:head]">
            <SectionHeading
              id="about-title"
              number="02"
              eyebrow={TEAM_SECTION.eyebrow}
              french={TEAM_SECTION.french}
              title={TEAM_SECTION.headline}
              align="left"
            />
          </Reveal>

          <Reveal delay={0.12} className="[grid-area:bio] lg:mt-6">
            <div className="max-w-xl space-y-4 text-[1.05rem] leading-relaxed text-creme-muted">
              {owner.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="mt-6 font-script text-5xl text-rose">
              <span className="sr-only">— </span>
              {owner.name}
            </p>
          </Reveal>
        </div>

        {others.length > 0 && (
          <>
            <Flourish className="mx-auto mt-20 w-32 text-rose/40" />
            <ul className="mt-12 flex flex-wrap justify-center gap-12">
              {others.map((member, i) => (
                <Reveal as="li" key={member.id} delay={i * motionTokens.reveal.stagger} className="w-full text-center sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)]">
                  <div className="arch relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden border border-rose/30">
                    <Image
                      src={member.photo}
                      alt={member.alt}
                      placeholder="blur"
                      sizes="280px"
                      className="h-full w-full object-cover object-[50%_20%]"
                    />
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-creme">{member.name}</h3>
                  <p className="mt-1 font-caps text-[0.68rem] font-semibold tracking-[0.3em] text-rose uppercase">
                    {member.role}
                  </p>
                  <div className="mx-auto mt-4 max-w-xs space-y-3 text-[0.98rem] leading-relaxed text-creme-muted">
                    {member.bio.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </Reveal>
              ))}
            </ul>
          </>
        )}
      </Container>
    </section>
  );
}
