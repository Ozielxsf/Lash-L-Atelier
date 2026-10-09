import { INSTALL } from "@/data/install";

/**
 * The studio dashboard's own web app manifest. Without it, "Add to Home
 * Screen" from /admin used the public manifest — whose start_url is "/" — so
 * the icon opened the public site instead of the dashboard.
 *
 * Its own `id` and `scope` make it a separate app from the public one, so
 * the owner can keep both on one phone. A route handler (not app/manifest.ts,
 * which Next only allows at the root); route handlers don't run the admin
 * layout, so this is public — it holds nothing private. Linked from
 * app/admin/layout.tsx.
 */
export const dynamic = "force-static";

export function GET() {
  const manifest = {
    id: "/admin",
    name: INSTALL.admin.name,
    short_name: INSTALL.admin.homeScreenName,
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7e6ec",
    theme_color: "#110a0f",
    icons: [
      { src: "/icons/admin-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/admin-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/admin-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "content-type": "application/manifest+json; charset=utf-8" },
  });
}
