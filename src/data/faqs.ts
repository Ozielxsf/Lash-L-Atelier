/**
 * Questions a new client actually asks. Rendered on /services and emitted as
 * FAQPage JSON-LD, so answer engines can lift them verbatim — keep every
 * answer short, factual and true.
 */
import { siteConfig, fullAddress } from "@/config/site.config";
import { WELCOME_OFFER } from "@/data/offers";

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "How do you say “L’Atelier”?",
    a: `Lah-tell-yay. It’s French for a workshop or studio — the place an artisan works by hand.`,
  },
  {
    q: "Which lash style is right for me?",
    a: "Classic is one extension per natural lash for clean definition. Hybrid mixes classics with soft fans for texture. Volume uses fans of ultra-fine lashes for a fuller line, and Mega Volume is the densest, most dramatic look. Not sure? Your esthetician will build a free beauty plan with you.",
  },
  {
    q: "How often do I need a lash fill?",
    a: "Every 2–3 weeks keeps a set looking full as your natural lashes shed and grow.",
  },
  {
    q: "Do I need to put a card on file to book?",
    a: "No. We never pre-charge a credit card, there are no membership dues, and you pay only when you receive a service.",
  },
  {
    q: "Is there a new client discount?",
    a: `Yes — $${WELCOME_OFFER.amount} off your first visit. ${WELCOME_OFFER.howTo}`,
  },
  {
    q: "How do I book an appointment?",
    a: `Call ${siteConfig.phone.display}. We’ll find a time that suits you.`,
  },
  {
    q: "Where is Lash L’Atelier?",
    a: `${fullAddress} — in Hickory, Washington County, Pennsylvania.`,
  },
];
