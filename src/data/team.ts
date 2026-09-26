import type { StaticImageData } from "next/image";
import lisa from "../../public/brand/lisa.webp";

/**
 * "Meet the Team" — the people behind the atelier.
 *
 * The owner is `featured`: a large portrait beside her own words. Everyone
 * else renders as an arched portrait card in the row beneath, so adding a
 * team member is one entry here — no layout changes. Real photos only (the
 * site's "no stock imagery" rule applies doubly to people).
 *
 * Only publish what each person has approved: name, role, photo and bio.
 */
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  photo: StaticImageData;
  alt: string;
  /** Written in the person's own voice, one paragraph per entry. */
  bio: string[];
  featured?: boolean;
};

export const TEAM_SECTION = {
  eyebrow: "Meet the Team",
  french: "L’Équipe",
  headline: "The hands behind the atelier.",
} as const;

export const TEAM: TeamMember[] = [
  {
    id: "lisa",
    name: "Lisa",
    role: "Owner & Founder",
    photo: lisa,
    alt: "Lisa, owner of Lash L’Atelier, smiling in a black blazer with long auburn hair",
    featured: true,
    bio: [
      "I started Lash L’Atelier to bring something truly different — and a little extraordinary — to our small country town. I wanted our neighbors to have a place of their own for high-end beauty services, without the drive into the city.",
      "Convenience was only half of it. I wanted it to be affordable, too. Our prices aren’t just competitive — they’re considerably lower than what you’ll typically find at studios in and around Pittsburgh, with the same care in every appointment.",
      "I can’t wait to welcome you in.",
    ],
  },
];
