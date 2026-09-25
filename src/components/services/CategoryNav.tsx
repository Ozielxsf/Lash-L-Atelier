import { MENU, RED_LIGHT } from "@/data/services";

/**
 * Sticky chips under the header for jumping between menu sections — the
 * menu is long on a phone. A horizontal scroller, so it carries
 * `data-lenis-prevent-horizontal` or it would be dead to touch (see
 * LenisProvider), and it is focusable as a region for keyboard users.
 */
export default function CategoryNav() {
  const items = [...MENU.map((c) => ({ id: c.id, label: c.title })), { id: RED_LIGHT.id, label: "Red Light" }, { id: "faq", label: "FAQ" }];
  return (
    <nav
      aria-label="Menu sections"
      className="sticky top-[68px] z-20 border-y border-line-dark bg-noir/90 backdrop-blur-md"
    >
      <ul
        data-lenis-prevent-horizontal
        className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 sm:justify-center sm:px-8"
      >
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="inline-flex min-h-10 items-center rounded-full border border-creme/20 px-4 text-[0.7rem] font-medium tracking-[0.18em] whitespace-nowrap text-creme/85 uppercase transition-colors hover:border-rose hover:text-rose"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
