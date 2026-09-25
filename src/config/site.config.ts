/**
 * Business facts — the non-design content the owner doesn't edit through an
 * admin panel (yet). Everything here was taken from the client's own flyer,
 * menu and brochure. Nothing is invented: where we don't know something yet
 * (hours, email, socials), the field is `null` and the UI hides it rather
 * than showing a placeholder.
 */

export type Hours = { days: string; time: string }[];

export const siteConfig = {
  name: "Lash L'Atelier",
  /** How the name is said — printed on the seal, so we print it too. */
  pronunciation: "lah-tell-yay",
  tagline: "A Parisian-Inspired Aesthetics Studio",
  /** The brochure's longer line — used where there's room to say what we do. */
  descriptor: "A Parisian-inspired luxury lash, brow & face atelier",
  description:
    "Lash L'Atelier is a Parisian-inspired lash, brow and skin studio in Hickory, Pennsylvania. Classic, hybrid, volume and mega volume lash extensions, brow lamination, organic and beef tallow facials, and red light therapy — with licensed estheticians, no card on file and no membership dues.",
  /**
   * The canonical origin — used for the link-preview image, canonicals,
   * sitemap and JSON-LD. NEXT_PUBLIC_SITE_URL wins if set; otherwise Vercel's
   * production URL, which Vercel switches to the custom domain on its own once
   * lashlatelier.com is connected. Hard-coding the domain before it resolves
   * meant texted links showed no preview image.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://lashlatelier.com"),

  phone: {
    display: "(724) 467-3479",
    e164: "+17244673479",
  },
  /** Not supplied yet. The footer and legal pages fall back to the phone. */
  email: null as string | null,

  address: {
    street: "26 Campbell Street",
    city: "Hickory",
    region: "PA",
    regionName: "Pennsylvania",
    postalCode: "15312",
    country: "US",
  },

  /**
   * Opening hours were not on any of the print pieces. Until the owner gives
   * them to us the site says "by appointment" — never a guessed schedule.
   */
  hours: null as Hours | null,

  /** Filled in as real profiles are confirmed. Empty strings never render. */
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
  },

  /** Studio credit in the footer. */
  builtBy: { name: "Wallink Systems", url: "https://wallinksystems.com" },
} as const;

export const fullAddress = `${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.region} ${siteConfig.address.postalCode}`;
