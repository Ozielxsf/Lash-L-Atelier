import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";
import type { Inline, LegalDoc } from "@/lib/legal";

function Text({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.bold ? (
          <strong key={i} className="font-semibold text-ink">
            {p.text}
          </strong>
        ) : p.italic ? (
          <em key={i}>{p.text}</em>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

/** Legal pages: same night-sky header, then a quiet, highly readable page of blush paper. */
export default function LegalDocument({ doc, french }: { doc: LegalDoc; french: string }) {
  return (
    <>
      <PageHeader french={french} title={doc.title} intro={doc.effective ? `Effective ${doc.effective}` : undefined} />
      <div className="papier on-light py-16 sm:py-24">
        <Container className="max-w-3xl">
          <article className="text-[1.02rem] leading-relaxed text-ink-soft">
            {doc.blocks.map((block, i) => {
              switch (block.type) {
                case "h2":
                  return (
                    <h2 key={i} id={block.id} className="mt-12 mb-4 scroll-mt-24 font-display text-[1.85rem] leading-tight font-medium text-ink first:mt-0">
                      {block.text}
                    </h2>
                  );
                case "p":
                  return (
                    <p key={i} className="mb-4">
                      <Text parts={block.content} />
                    </p>
                  );
                case "ul":
                  return (
                    <ul key={i} className="mb-5 list-disc space-y-2 pl-5 marker:text-rouge">
                      {block.items.map((item, j) => (
                        <li key={j}>
                          <Text parts={item} />
                        </li>
                      ))}
                    </ul>
                  );
                case "hr":
                  return <hr key={i} className="my-10 border-ink/15" />;
              }
            })}
          </article>
        </Container>
      </div>
    </>
  );
}
