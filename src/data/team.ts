import type { StaticImageData } from "next/image";
import lisa from "../../public/brand/lisa.webp";
import hanna from "../../public/brand/hanna.webp";
import arianna from "../../public/brand/arianna.webp";

/**
 * "Meet the Team" — the people behind the atelier.
 *
 * Each person gets a name pill and a panel (TeamTabs); the `featured`
 * owner comes first. Adding a team member is one entry here — no
 * layout changes. Real photos only (the
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
  {
    id: "hanna",
    name: "Hanna",
    role: "Esthetician",
    photo: hanna,
    alt: "Hanna, esthetician at Lash L’Atelier, with dark hair pulled back, gold earrings and a black blazer",
    // ⚠️ MOCK-UP bio written for the layout — replace with Hanna's own words
    // once she's approved them (CLAUDE.md → content still needed).
    bio: [
      "Hi, I’m Hanna! Nothing makes my day like the moment a client opens their eyes, sees the mirror and lights up.",
      "I love taking the time to find what suits you — your eyes, your skin, your everyday — so you leave feeling like the most polished version of yourself.",
    ],
  },
  {
    id: "arianna",
    name: "Arianna",
    role: "Esthetician",
    photo: arianna,
    alt: "Arianna, esthetician at Lash L’Atelier, with long wavy honey-brown hair and a white blazer",
    // ⚠️ MOCK-UP bio written for the layout — replace with Arianna's own words
    // once she's approved them (CLAUDE.md → content still needed).
    bio: [
      "Hi, I’m Arianna! To me, the best beauty looks effortless — like you, on your very best day.",
      "I love the calm of a treatment room: a little quiet, a little pampering, and an hour that’s all yours. My goal is for you to walk out glowing and already looking forward to coming back.",
    ],
  },
];
