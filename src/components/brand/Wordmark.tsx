import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

type Size = "hero" | "header" | "footer";

const SIZES: Record<Size, { script: string; caps: string; rule: string; say: string; gap: string }> = {
  hero: {
    script: "text-[clamp(5.5rem,27vw,11.5rem)] leading-[0.85]",
    caps: "text-[clamp(1.35rem,6.4vw,2.6rem)] tracking-[0.2em]",
    rule: "w-[clamp(1.5rem,8vw,4rem)]",
    say: "text-[clamp(0.95rem,3.6vw,1.2rem)]",
    gap: "gap-3 sm:gap-4",
  },
  header: {
    script: "text-[1.9rem] leading-[0.8]",
    caps: "text-[0.56rem] tracking-[0.28em]",
    rule: "w-3",
    say: "hidden",
    gap: "gap-1.5",
  },
  footer: {
    script: "text-[4.2rem] leading-[0.85]",
    caps: "text-[0.95rem] tracking-[0.24em]",
    rule: "w-6",
    say: "text-sm",
    gap: "gap-2.5",
  },
};

/**
 * The typeset "Lash — L'ATELIER — (lah-tell-yay)" lockup from the client's
 * seal. Set in live type rather than an image so it stays razor-sharp at any
 * size and weighs nothing. The visual is aria-hidden; screen readers get the
 * name once, spelled normally.
 */
export default function Wordmark({
  size = "hero",
  showPronunciation = size !== "header",
  className,
  animate = false,
}: {
  size?: Size;
  showPronunciation?: boolean;
  className?: string;
  /** Hero only: the script writes itself in, then the capitals rise. */
  animate?: boolean;
}) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex flex-col items-center", className)}>
      <span className="sr-only">{siteConfig.name}</span>
      <span aria-hidden="true" className="flex flex-col items-center">
        <span
          className={cn(
            "font-script text-rose [text-shadow:0_2px_24px_rgb(242_167_198/0.35)]",
            // Script swashes overhang their box; a little padding keeps the
            // clip-path reveal from shaving the loop of the L.
            "px-[0.12em]",
            s.script,
            animate && "ink-in",
          )}
        >
          Lash
        </span>
        <span
          className={cn("mt-[-0.02em] flex items-center", s.gap, animate && "rise-in")}
          style={animate ? ({ "--d": "0.45s" } as React.CSSProperties) : undefined}
        >
          <span className={cn("h-px bg-gradient-to-l from-creme/80 to-transparent", s.rule)} />
          <span className={cn("font-caps font-semibold text-creme", s.caps)}>L&rsquo;Atelier</span>
          <span className={cn("h-px bg-gradient-to-r from-creme/80 to-transparent", s.rule)} />
        </span>
        {showPronunciation && (
          <span
            className={cn("mt-1 font-display italic text-creme-muted", s.say, animate && "rise-in")}
            style={animate ? ({ "--d": "0.55s" } as React.CSSProperties) : undefined}
          >
            ({siteConfig.pronunciation})
          </span>
        )}
      </span>
    </span>
  );
}
