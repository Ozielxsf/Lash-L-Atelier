import Flourish from "@/components/brand/Flourish";
import Sparkle from "@/components/brand/Sparkle";

/**
 * The opening of every inner page: a short stretch of the same night sky as
 * the home hero, so moving between pages never feels like leaving the street.
 */
export default function PageHeader({
  french,
  title,
  intro,
  children,
}: {
  french?: string;
  title: string;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="sky-glow relative isolate overflow-hidden pt-32 pb-16 text-center sm:pt-40 sm:pb-20">
      <div aria-hidden="true" className="glitter-dust absolute inset-0 -z-10 opacity-60" />
      <Sparkle density={0.9} seed={17} className="-z-10" />
      <div className="mx-auto max-w-3xl px-5">
        {french && (
          <p aria-hidden="true" className="rise-in font-script text-5xl leading-none text-rose sm:text-6xl">
            {french}
          </p>
        )}
        <h1
          className="rise-in mt-2 font-display text-[clamp(2.8rem,12vw,5rem)] leading-none font-medium text-creme"
          style={{ "--d": "0.15s" } as React.CSSProperties}
        >
          {title}
        </h1>
        <Flourish className="rise-in mx-auto mt-6 text-rose/70" />
        {intro && (
          <p
            className="rise-in mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed text-creme-muted text-pretty"
            style={{ "--d": "0.3s" } as React.CSSProperties}
          >
            {intro}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}
