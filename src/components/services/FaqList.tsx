import { Plus } from "lucide-react";
import type { Faq } from "@/data/faqs";

/**
 * Native <details> — keyboard and screen-reader accessible with no script,
 * and the answers are in the HTML for crawlers that don't run JavaScript.
 */
export default function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-ink/12 border-y border-ink/12">
      {faqs.map((faq) => (
        <details key={faq.q} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 font-display text-[1.35rem] leading-snug text-ink [&::-webkit-details-marker]:hidden">
            {faq.q}
            <Plus
              className="h-5 w-5 shrink-0 text-rouge transition-transform duration-300 group-open:rotate-45"
              aria-hidden="true"
            />
          </summary>
          <p className="pb-5 leading-relaxed text-ink-soft">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
