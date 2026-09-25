import { siteConfig, fullAddress } from "@/config/site.config";

/** "$150" — whole dollars, which is how the studio prices everything. */
export function formatCurrency(dollars: number): string {
  return `$${dollars.toLocaleString("en-US")}`;
}

/** A price, or the fallback copy for services priced per consultation. */
export function formatPrice(dollars: number | null, fallback = "Priced to you"): string {
  return dollars === null ? fallback : formatCurrency(dollars);
}

export const telHref = `tel:${siteConfig.phone.e164}`;

/** Opens the native maps app on phones (Google Maps universal link). */
export const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${siteConfig.name}, ${fullAddress}`,
)}`;
