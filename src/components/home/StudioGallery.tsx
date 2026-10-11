import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import { STUDIO_GALLERY } from "@/data/atelier";
import { motionTokens } from "@/config/brand.config";

/**
 * "Step inside" — the studio's own photos, each in an arched window like the
 * promise cards below. A swipe row on a phone (three tall photos stacked
 * would be ~1,400px), three across from sm up. data-lenis-prevent-horizontal
 * or the row is dead to touch.
 */
export default function StudioGallery() {
  const { french, title, photos } = STUDIO_GALLERY;
  return (
    <div className="mt-16 sm:mt-20">
      <Reveal className="text-center">
        <p aria-hidden="true" className="font-script text-4xl leading-none text-rouge/85">
          {french}
        </p>
        <h3 className="mt-1 font-caps text-[0.72rem] font-semibold tracking-[0.3em] text-ink uppercase">{title}</h3>
      </Reveal>
      <ul
        data-lenis-prevent-horizontal
        tabIndex={0}
        aria-label="Photos of the studio"
        className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0"
      >
        {photos.map((photo, i) => (
          <Reveal
            as="li"
            key={photo.caption}
            delay={i * motionTokens.reveal.stagger}
            className="w-[72vw] max-w-[300px] shrink-0 snap-center sm:w-auto sm:max-w-none"
          >
            <figure>
              <div className="arch relative aspect-[3/4] overflow-hidden border border-rouge/25 bg-papier-lift shadow-soft">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  placeholder="blur"
                  sizes="(min-width: 1280px) 384px, (min-width: 640px) 31vw, 72vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-center font-display text-lg text-ink-soft italic">{photo.caption}</figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
