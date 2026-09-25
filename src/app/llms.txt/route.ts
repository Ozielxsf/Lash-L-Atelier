import { fullAddress, siteConfig } from "@/config/site.config";
import { FAQS } from "@/data/faqs";
import { HOUSE_RULES } from "@/data/promises";
import { WELCOME_OFFER } from "@/data/offers";
import { MENU, RED_LIGHT } from "@/data/services";
import { formatPrice } from "@/lib/format";
import { isOnlineBookingEnabled } from "@/lib/booking-settings";

/**
 * /llms.txt — the plain-markdown brief an answer engine reads. Generated from
 * the same data the pages render, never hand-written, so a price here can't
 * disagree with the menu.
 */
export const dynamic = "force-static";

export async function GET() {
  const online = await isOnlineBookingEnabled();
  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `- Pronounced: ${siteConfig.pronunciation}`,
    `- Address: ${fullAddress}`,
    `- Phone: ${siteConfig.phone.display}`,
    `- Booking: ${online ? `online at ${siteConfig.url}/book, or by phone` : "by phone"}`,
    `- Hours: ${siteConfig.hours ? siteConfig.hours.map((h) => `${h.days} ${h.time}`).join("; ") : "by appointment"}`,
    `- House rules: ${HOUSE_RULES.join("; ")}`,
    `- New clients: $${WELCOME_OFFER.amount} off the first visit`,
    "",
    "## Menu (USD)",
    ...MENU.flatMap((c) => [
      "",
      `### ${c.title}`,
      ...(c.note ? [c.note] : []),
      ...c.services.map((s) => `- ${s.name.replace(/[“”]/g, '"')}: ${formatPrice(s.price)}${s.detail ? ` (${s.detail})` : ""}`),
    ]),
    "",
    `### ${RED_LIGHT.title}`,
    `${RED_LIGHT.priceNote}. Focus areas: ${RED_LIGHT.focuses.join(", ")}. Cosmetic service, not medical treatment.`,
    "",
    "## FAQ",
    ...FAQS.flatMap((f) => ["", `**${f.q}**`, f.a]),
    "",
    "## Pages",
    `- [Home](${siteConfig.url}/)`,
    `- [Menu & prices](${siteConfig.url}/services)`,
    `- [Visit](${siteConfig.url}/visit)`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
