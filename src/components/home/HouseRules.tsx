import { HOUSE_RULES } from "@/data/promises";

function Glint() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3 shrink-0 text-gaslight">
      <path d="M10 0 Q11 9 20 10 Q11 11 10 20 Q9 11 0 10 Q9 9 10 0Z" fill="currentColor" />
    </svg>
  );
}

/**
 * The line the client prints at the foot of every piece, promoted to a
 * ribbon directly under the hero: it's the reason to choose them over a
 * chain studio, so it's the second thing anyone reads. Static — nothing here
 * moves on its own.
 */
export default function HouseRules() {
  return (
    <section aria-label="House rules" className="relative border-y border-rose/20 bg-noir-soft">
      <ul className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-6 sm:flex-row sm:justify-center sm:gap-8">
        {HOUSE_RULES.map((rule, i) => (
          <li key={rule} className="flex items-center gap-3 sm:gap-8">
            {i > 0 && (
              <span className="hidden sm:block">
                <Glint />
              </span>
            )}
            <span className="flex items-center gap-3 font-caps text-[0.74rem] font-semibold tracking-[0.24em] text-creme uppercase">
              <span className="sm:hidden">
                <Glint />
              </span>
              {rule}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
