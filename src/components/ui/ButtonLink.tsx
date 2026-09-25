import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "rouge" | "rose" | "outline-dark" | "outline-light";

const VARIANTS: Record<Variant, string> = {
  // The primary action on any surface: deep rose, white text (≈6.9:1).
  rouge:
    "bg-rouge text-white shadow-[0_10px_30px_-10px_rgb(168_38_79/0.7)] hover:bg-rouge-deep",
  // Script pink on the night sky — used for the hero's primary.
  rose: "bg-rose text-noir shadow-[0_10px_40px_-12px_rgb(242_167_198/0.8)] hover:bg-rose-soft",
  "outline-dark": "border border-creme/35 text-creme hover:border-rose hover:text-rose",
  "outline-light": "border border-ink/25 text-ink hover:border-rouge hover:text-rouge",
};

/**
 * Every call to action on the site. Min 48px tall (WCAG target size), with a
 * press state for touch since phones have no hover. `tel:` / `http` links
 * render a plain <a>; site paths go through next/link for prefetching.
 */
export default function ButtonLink({
  href,
  children,
  variant = "rouge",
  className,
  ariaLabel,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  ariaLabel?: string;
  icon?: React.ReactNode;
}) {
  const classes = cn(
    "group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-7 py-3",
    "font-sans text-[0.8rem] font-medium uppercase tracking-[0.2em]",
    "transition-[background-color,color,border-color,transform] duration-300 ease-soir active:scale-[0.98]",
    VARIANTS[variant],
    className,
  );
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );
  const isExternal = /^(tel:|mailto:|https?:)/.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} aria-label={ariaLabel}>
      {content}
    </Link>
  );
}
