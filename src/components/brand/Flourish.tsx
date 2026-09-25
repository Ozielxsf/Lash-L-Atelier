import { cn } from "@/lib/utils";

/**
 * The scrolled divider that sits under every heading on the client's print
 * pieces — a hairline, a pair of curls and a diamond. Drawn as SVG in
 * currentColor so it takes the colour of whatever surface it's on.
 */
export default function Flourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 24"
      aria-hidden="true"
      className={cn("h-4 w-44 text-current", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      {/* Hairlines fade toward the ends in three steps — no gradient ids,
          so any number of flourishes can share a page. */}
      <path d="M4 12 H34" strokeWidth="1" opacity="0.25" />
      <path d="M34 12 H62" strokeWidth="1" opacity="0.55" />
      <path d="M62 12 H88" strokeWidth="1" />
      <path d="M152 12 H178" strokeWidth="1" />
      <path d="M178 12 H206" strokeWidth="1" opacity="0.55" />
      <path d="M206 12 H236" strokeWidth="1" opacity="0.25" />
      <g strokeWidth="1.1">
        <path d="M114 12 C107 3.5 95 4 93.5 11 C92.6 15.6 98.6 17 100.4 13.2" />
        <path d="M111 12 C105 18.5 97 19.5 92 16" />
        <path d="M126 12 C133 3.5 145 4 146.5 11 C147.4 15.6 141.4 17 139.6 13.2" />
        <path d="M129 12 C135 18.5 143 19.5 148 16" />
      </g>
      <path d="M120 6.5 L124.5 12 L120 17.5 L115.5 12 Z" fill="currentColor" stroke="none" />
      <circle cx="88" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="152" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
