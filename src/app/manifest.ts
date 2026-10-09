import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import { INSTALL } from "@/data/install";

/**
 * Web app manifest — what makes "Add to Home Screen" feel like an app:
 * Android Chrome can offer a real install prompt, and the icon opens
 * full-screen in the studio's colours. Icons are rendered from
 * scripts/app-icon/icon.html.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: siteConfig.name,
    short_name: INSTALL.homeScreenName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#110a0f",
    theme_color: "#110a0f",
    categories: ["beauty", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
