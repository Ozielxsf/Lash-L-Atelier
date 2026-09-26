import Reveal from "@/components/motion/Reveal";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TeamTabs from "@/components/home/TeamTabs";
import { TEAM, TEAM_SECTION } from "@/data/team";

/**
 * N° 02 — Meet the Team. After "what an atelier is" comes who works in it.
 * One person at a time, chosen from name pills (see TeamTabs): each in an
 * arched window beside a note in their own words, signed in script like a
 * letter. The owner (`featured`) comes first. Oziel felt the site was a lot
 * of vertical scrolling — three stacked profiles were ~2,800px on a phone.
 */
export default function Team() {
  if (!TEAM.length) return null;
  const members = [...TEAM].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  return (
    <section id="about" aria-labelledby="about-title" className="relative scroll-mt-20 bg-noir-soft py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            id="about-title"
            number="02"
            eyebrow={TEAM_SECTION.eyebrow}
            french={TEAM_SECTION.french}
            title={TEAM_SECTION.headline}
          />
        </Reveal>
        <Reveal delay={0.08}>
          <TeamTabs members={members} />
        </Reveal>
      </Container>
    </section>
  );
}
