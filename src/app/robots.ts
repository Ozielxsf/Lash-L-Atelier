import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";

/**
 * AI answer engines are named individually, not left to the wildcard.
 * Cloudflare can inject its own managed Disallow groups above ours, and a
 * specific User-agent group beats `*` — so naming them keeps our Allow at the
 * same specificity (Wallink AEO audit, Sept 2026). "Lash studio near me"
 * increasingly gets answered by an assistant; the studio should be in it.
 *
 * ⚠️ Disallow is a crawl rule, not noindex. Private areas added later
 * (admin, booking management) get a `noindex` meta and stay crawlable.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  const rule = { allow: "/", disallow: ["/api/"] };
  return {
    rules: [{ userAgent: "*", ...rule }, ...AI_CRAWLERS.map((userAgent) => ({ userAgent, ...rule }))],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
