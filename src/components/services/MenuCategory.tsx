import Image from "next/image";
import Flourish from "@/components/brand/Flourish";
import Reveal from "@/components/motion/Reveal";
import type { MenuPhoto } from "@/data/menu-photos";
import type { ServiceCategory } from "@/data/services";
import { formatPrice } from "@/lib/format";

/**
 * One section of the full menu: the café-menu layout, dotted leaders to each
 * price. Photos (data/menu-photos.ts) sit under the prices — the menu is read
 * for prices first, then the photos show what they buy. Several photos stack
 * edge to edge like one comparison card, each labelled in the site's type.
 */
export default function MenuCategory({ category, photos = [] }: { category: ServiceCategory; photos?: MenuPhoto[] }) {
  return (
    <Reveal>
      <section id={category.id} aria-labelledby={`${category.id}-title`} className="scroll-mt-36">
        <p aria-hidden="true" className="font-script text-[2.4rem] leading-none text-rouge/85">
          {category.french}
        </p>
        <h2 id={`${category.id}-title`} className="mt-1 font-display text-[2.3rem] leading-tight font-medium text-ink">
          {category.title}
        </h2>
        <Flourish className="mt-2 -ml-3 w-36 text-rouge/50" />
        <p className="mt-3 max-w-md leading-relaxed text-ink-soft">{category.intro}</p>
        {category.note && (
          <p className="mt-2 font-display text-lg text-rouge italic">{category.note}</p>
        )}
        <ul className="mt-6">
          {category.services.map((service) => (
            <li key={service.id} className="border-b border-ink/10 py-3.5 last:border-0">
              <div className="flex items-baseline">
                <span className="font-display text-[1.3rem] leading-snug text-ink">{service.name}</span>
                <span aria-hidden="true" className="leader text-ink" />
                <span className="nums-lining font-display text-[1.35rem] font-medium text-ink">
                  {formatPrice(service.price)}
                </span>
              </div>
              {service.detail && <p className="mt-0.5 pr-16 text-sm text-ink-soft">{service.detail}</p>}
            </li>
          ))}
        </ul>
        {photos.length > 0 && (
          <ul className="mt-6 overflow-hidden rounded-[14px] border border-rouge/20 shadow-soft">
            {photos.map((photo) => (
              <li key={photo.label} className="relative border-b-2 border-papier last:border-0">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  placeholder="blur"
                  sizes="(min-width: 1024px) 520px, calc(100vw - 40px)"
                  className="block h-auto w-full"
                />
                <span className="absolute bottom-2.5 left-2.5 rounded-full bg-noir/85 px-3 py-1 font-caps text-[0.62rem] font-semibold tracking-[0.22em] text-creme uppercase">
                  {photo.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}
