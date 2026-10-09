import type { Metadata } from "next";
import { INSTALL } from "@/data/install";

/*
 * Private area. `noindex` keeps it out of search results; it stays crawlable
 * on purpose (Disallow would stop crawlers ever reading the noindex — see the
 * Wallink "Disallow is not noindex" note). Auth is enforced per page and per
 * server action with requireAdmin(), never here.
 */
export const metadata: Metadata = {
  title: "Studio admin",
  robots: { index: false, follow: false },
  // "Add to Home Screen" from here installs the dashboard as its own app —
  // opens on /admin, labelled "Studio Admin", with the blush ADMIN icon —
  // instead of the public site. See app/admin/manifest.webmanifest.
  manifest: "/admin/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/icons/admin-180.png" },
  appleWebApp: { capable: true, title: INSTALL.admin.homeScreenName, statusBarStyle: "black" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="on-light min-h-dvh bg-papier text-ink">{children}</div>;
}
