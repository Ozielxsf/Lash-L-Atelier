import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileActionBar from "@/components/layout/MobileActionBar";
import LenisProvider from "@/components/motion/LenisProvider";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site.config";
import { businessSchema, websiteSchema } from "@/lib/schema";
import "./globals.css";

const greatVibes = Great_Vibes({ variable: "--font-great-vibes", subsets: ["latin"], weight: "400", display: "swap" });
const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["400", "600"], display: "swap" });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});
const jost = Jost({ variable: "--font-jost", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

const title = `${siteConfig.name} | Lash Extensions, Brows & Facials in Hickory, PA`;

/*
 * ⚠️ No `alternates.canonical` here. Metadata is inherited, so a canonical in
 * the root layout would declare the homepage as the canonical of every page
 * that forgets to override it. Each page sets its own.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description: siteConfig.description },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#110a0f",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${greatVibes.variable} ${cinzel.variable} ${cormorant.variable} ${jost.variable} antialiased`}
    >
      <body className="min-h-dvh font-sans">
        <a
          href="#main"
          className="fixed top-3 left-3 z-[60] -translate-y-24 rounded-full bg-rose px-5 py-3 text-sm font-medium text-noir transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <JsonLd data={businessSchema()} />
        <JsonLd data={websiteSchema()} />
        <LenisProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MobileActionBar />
        </LenisProvider>
      </body>
    </html>
  );
}
