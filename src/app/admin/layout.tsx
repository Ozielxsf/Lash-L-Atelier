import type { Metadata } from "next";

/*
 * Private area. `noindex` keeps it out of search results; it stays crawlable
 * on purpose (Disallow would stop crawlers ever reading the noindex — see the
 * Wallink "Disallow is not noindex" note). Auth is enforced per page and per
 * server action with requireAdmin(), never here.
 */
export const metadata: Metadata = {
  title: "Studio admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="on-light min-h-dvh bg-papier text-ink">{children}</div>;
}
