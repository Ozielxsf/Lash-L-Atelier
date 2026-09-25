import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import { isOnlineBookingEnabled } from "@/lib/booking-settings";

const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/visit", priority: 0.8, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/accessibility", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /book is only listed while it's open to the public (it's noindex otherwise).
  const routes = (await isOnlineBookingEnabled())
    ? [...ROUTES, { path: "/book", priority: 0.9, changeFrequency: "weekly" as const }]
    : ROUTES;
  return routes.map((r) => ({ url: `${siteConfig.url}${r.path}`, changeFrequency: r.changeFrequency, priority: r.priority }));
}
