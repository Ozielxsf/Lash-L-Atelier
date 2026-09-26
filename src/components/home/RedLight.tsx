import { Phone } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { RED_LIGHT, RED_LIGHT_DISCLAIMER, findService } from "@/data/services";
import { formatPrice, telHref } from "@/lib/format";
import { siteConfig } from "@/config/site.config";

/**
 * N° 05 — La Lumière Rouge. The one place on the site the rose is allowed to
 * glow: a soft red halo behind the list, standing in for the light itself.
 * Every claim here is the brochure's cosmetic wording, and the disclaimer is
 * never separated from it (see RED_LIGHT in data/services.ts).
 */
export default function RedLight() {
  const facial = findService("red-light-therapy-facial");
  return (
    <section aria-labelledby="red-light-title" className="relative isolate overflow-hidden bg-noir-soft py-20 sm:py-28">
      <div aria-hidden="true" className="red-halo absolute top-1/2 left-1/2 -z-10 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70" />
      <Container>
        <SectionHeading
          id="red-light-title"
          number="05"
          eyebrow="Red Light Therapy"
          french={RED_LIGHT.french}
          title="A gentle glow, planned around your skin."
          intro={RED_LIGHT.intro}
        />

        <Reveal className="mx-auto mt-12 max-w-3xl">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {RED_LIGHT.focuses.map((focus) => (
              <li
                key={focus}
                className="flex min-h-20 items-center justify-center rounded-2xl border border-rose/20 bg-noir/80 px-3 py-4 text-center font-display text-[1.15rem] leading-tight text-creme"
              >
                {focus}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-[0.98rem] text-creme-muted">
            Or try it as part of a facial — the Red Light Therapy Facial is{" "}
            <span className="nums-lining text-creme">{formatPrice(facial?.price ?? null)}</span>.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink
              href={telHref}
              variant="outline-dark"
              ariaLabel={`Call ${siteConfig.name} about red light therapy`}
              icon={<Phone className="h-4 w-4" aria-hidden="true" />}
            >
              Ask about a plan
            </ButtonLink>
          </div>
          <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-creme-muted">{RED_LIGHT_DISCLAIMER}</p>
        </Reveal>
      </Container>
    </section>
  );
}
