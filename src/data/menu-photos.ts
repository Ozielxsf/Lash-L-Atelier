import type { StaticImageData } from "next/image";
import browLamination from "../../public/brand/brow-lamination.webp";
import { LASH_STYLES } from "@/data/lash-styles";

/**
 * Photos shown under a section of the full menu (/services), keyed by the
 * category id in data/services.ts. Kept out of services.ts on purpose: that
 * file is read by the booking API too, which has no use for images.
 *
 * - Lash Extensions: the four looks stacked, the same eye each time — the
 *   price list says what each set costs, this says what each one looks like.
 * - Brows & Beauty: brow lamination, the service that's hardest to picture
 *   from its name and the priciest on that list.
 */
export type MenuPhoto = { src: StaticImageData; alt: string; label: string };

export const MENU_PHOTOS: Record<string, MenuPhoto[]> = {
  "lash-extensions": LASH_STYLES.map((s) => ({ src: s.photo.src, alt: s.photo.alt, label: s.name })),
  brows: [
    {
      src: browLamination,
      label: "Brow lamination",
      alt: "Close-up of laminated brows — brushed up, full and glossy — above grey-blue eyes",
    },
  ],
};
