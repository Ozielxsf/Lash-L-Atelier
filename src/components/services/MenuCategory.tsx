import Flourish from "@/components/brand/Flourish";
import Reveal from "@/components/motion/Reveal";
import type { ServiceCategory } from "@/data/services";
import { formatPrice } from "@/lib/format";

/** One section of the full menu: the café-menu layout, dotted leaders to each price. */
export default function MenuCategory({ category }: { category: ServiceCategory }) {
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
      </section>
    </Reveal>
  );
}
