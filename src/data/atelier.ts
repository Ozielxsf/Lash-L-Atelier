import type { StaticImageData } from "next/image";
import treatmentRoom from "../../public/brand/studio-treatment-room.webp";
import lashBar from "../../public/brand/studio-lash-bar.webp";
import lounge from "../../public/brand/studio-lounge.webp";

/** Copy for the "L'Atelier" introduction on the home page. */
export const ATELIER = {
  eyebrow: "L’Atelier",
  definition: {
    word: "l’atelier",
    say: "lah·tell·yay",
    part: "noun, French",
    meaning: "a workshop where an artisan works by hand.",
  },
  headline: "A small Parisian workshop for your lashes, brows and skin.",
  paragraphs: [
    "Lash L’Atelier is a studio on Campbell Street in Hickory built around one idea: beauty work is handwork. Every lash is placed one at a time. Every brow is shaped to your face, not a stencil.",
    "It feels like an evening in Paris — roses, lamplight and a little sparkle — with none of the fuss. No card on file, no membership, and a licensed esthetician who takes the time to plan what’s right for you.",
  ],
  signature: "À bientôt",
} as const;

export type StudioPhoto = { src: StaticImageData; alt: string; caption: string };

/**
 * "Step inside" — the studio's own photos (supplied Oct 2026), shown right
 * after the copy promises roses, lamplight and a little sparkle, so the
 * promise is proved on the spot. The treatment room leads: the Eiffel Tower
 * mural is the shot that says "Parisian" before a word is read.
 */
export const STUDIO_GALLERY: { french: string; title: string; photos: StudioPhoto[] } = {
  french: "Entrez",
  title: "Step inside",
  photos: [
    {
      src: treatmentRoom,
      caption: "The treatment room",
      alt: "The Lash L’Atelier treatment room: blush-pink treatment beds on grey rugs beside a black-and-white striped wall hung with paper roses, facing a mural of the Eiffel Tower framed by pink curtains and roses",
    },
    {
      src: lashBar,
      caption: "The lash bar",
      alt: "The lash bar: a white counter of lash tools, candlesticks and little Eiffel Towers along a black-and-white striped wall with pink paper flowers, beside a treatment bed with gingham and rose pillows",
    },
    {
      src: lounge,
      caption: "The lounge",
      alt: "The lounge: a striped bench piled with floral cushions under a rose-covered window glowing with a pink neon sign, between rose trellises and a framed map of Paris",
    },
  ],
};
