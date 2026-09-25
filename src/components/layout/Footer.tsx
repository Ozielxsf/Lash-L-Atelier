import Image from "next/image";
import Link from "next/link";
import Flourish from "@/components/brand/Flourish";
import Container from "@/components/ui/Container";
import { siteConfig } from "@/config/site.config";
import { HOUSE_RULES } from "@/data/promises";
import { LEGAL_LINKS, NAV_LINKS } from "@/data/navigation";
import { directionsHref, telHref } from "@/lib/format";

/**
 * The footer closes the evening: the client's own round seal, the address
 * as it would be painted on the shop window, and the house rules once more.
 */
export default function Footer() {
  const { address, phone, hours, email } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line-dark bg-noir pt-16 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-12">
      <div aria-hidden="true" className="glitter-dust pointer-events-none absolute inset-0 opacity-40" />
      <Container className="relative">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/seal.webp"
            alt={`${siteConfig.name} seal — ${siteConfig.tagline}`}
            width={320}
            height={320}
            sizes="176px"
            className="h-44 w-44 drop-shadow-[0_18px_40px_rgb(242_167_198/0.25)]"
          />
          <p className="mt-6 font-display text-xl text-balance text-creme italic">{siteConfig.descriptor}.</p>
          <Flourish className="mt-4 text-rose/60" />
        </div>

        <div className="mt-12 grid gap-10 text-center sm:grid-cols-3 sm:text-left">
          <div>
            <h2 className="font-caps text-[0.7rem] font-semibold tracking-[0.3em] text-rose uppercase">Visit</h2>
            <address className="nums-lining mt-4 text-[0.98rem] leading-relaxed text-creme not-italic">
              {address.street}
              <br />
              {address.city}, {address.region} {address.postalCode}
            </address>
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-rose underline decoration-rose/40 underline-offset-4 hover:decoration-rose"
            >
              Get directions
            </a>
          </div>

          <div>
            <h2 className="font-caps text-[0.7rem] font-semibold tracking-[0.3em] text-rose uppercase">Book</h2>
            <a href={telHref} className="nums-lining mt-4 inline-block font-display text-2xl text-creme hover:text-rose">
              {phone.display}
            </a>
            {email && (
              <a href={`mailto:${email}`} className="mt-1 block text-sm text-creme-muted hover:text-rose">
                {email}
              </a>
            )}
            <p className="mt-2 text-sm text-creme-muted">
              {hours ? hours.map((h) => `${h.days} ${h.time}`).join(" · ") : "By appointment"}
            </p>
          </div>

          <div>
            <h2 className="font-caps text-[0.7rem] font-semibold tracking-[0.3em] text-rose uppercase">House rules</h2>
            <ul className="mt-4 space-y-1.5 text-[0.98rem] text-creme">
              {HOUSE_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        <nav aria-label="Footer" className="mt-14 border-t border-line-dark pt-8">
          <ul className="flex flex-wrap justify-center gap-x-7 gap-y-3 text-[0.75rem] font-medium tracking-[0.2em] uppercase">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-creme/80 hover:text-rose">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 flex flex-col items-center gap-3 text-xs text-creme-muted sm:flex-row sm:justify-between">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex gap-5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-rose">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p>
            Site by{" "}
            <a href={siteConfig.builtBy.url} target="_blank" rel="noopener" className="hover:text-rose">
              {siteConfig.builtBy.name}
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
