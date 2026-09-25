import Flourish from "@/components/brand/Flourish";
import { cn } from "@/lib/utils";

/**
 * The heading block every section opens with, mirroring the menu board:
 * a small-caps label, an editorial title, and the flourish beneath.
 *
 * `number` gives the Parisian "N° 01" marker; `french` the aside in script.
 */
export default function SectionHeading({
  number,
  eyebrow,
  french,
  title,
  intro,
  tone = "dark",
  align = "center",
  id,
  className,
}: {
  number?: string;
  eyebrow: string;
  french?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  tone?: "dark" | "light";
  align?: "center" | "left";
  id?: string;
  className?: string;
}) {
  const light = tone === "light";
  return (
    <div className={cn("flex flex-col", align === "center" ? "items-center text-center" : "items-start text-left", className)}>
      <p
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-caps text-[0.7rem] font-semibold tracking-[0.3em] uppercase",
          light ? "text-rouge" : "text-rose",
        )}
      >
        {number && (
          <>
            <span className="nums-lining whitespace-nowrap">N° {number}</span>
            <span aria-hidden="true" className={cn("h-px w-6", light ? "bg-rouge/50" : "bg-rose/50")} />
          </>
        )}
        <span>{eyebrow}</span>
      </p>
      {french && (
        <p
          aria-hidden="true"
          className={cn("mt-3 font-script text-4xl leading-none sm:text-5xl", light ? "text-rouge/80" : "text-rose/90")}
        >
          {french}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          "mt-3 max-w-[18ch] font-display text-[clamp(2.1rem,8.5vw,3.6rem)] leading-[1.02] font-medium text-balance",
          light ? "text-ink" : "text-creme",
        )}
      >
        {title}
      </h2>
      <Flourish className={cn("mt-5", light ? "text-rouge/70" : "text-rose/70")} />
      {intro && (
        <p className={cn("mt-5 max-w-[34rem] text-[1.02rem] leading-relaxed text-pretty", light ? "text-ink-soft" : "text-creme-muted")}>
          {intro}
        </p>
      )}
    </div>
  );
}
