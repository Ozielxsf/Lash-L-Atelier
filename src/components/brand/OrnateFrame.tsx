import { cn } from "@/lib/utils";

function Corner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("absolute h-8 w-8 text-current sm:h-10 sm:w-10", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {/* Concave notch + curl, echoing the corners of the client's flyer frame. */}
      <path d="M1 22 V14 A13 13 0 0 0 14 1 H22" />
      <path d="M5 39 V20 C5 11 11 5 20 5 H39" opacity="0.7" />
      <path d="M11 17 C11 13 13 11 17 11" />
      <circle cx="17" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * A double-rule frame with ornamental corners — the border the client uses
 * on the flyer, the brochure panels and the price card. Place inside a
 * `relative` parent; it never takes pointer events.
 */
export default function OrnateFrame({ className, inset = "inset-3 sm:inset-4" }: { className?: string; inset?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute", inset, className)}>
      <div className="absolute inset-0 border border-current opacity-60 [clip-path:polygon(22px_0,calc(100%-22px)_0,100%_22px,100%_calc(100%-22px),calc(100%-22px)_100%,22px_100%,0_calc(100%-22px),0_22px)]" />
      <div className="absolute inset-[5px] border border-current opacity-25" />
      <Corner className="top-0 left-0" />
      <Corner className="top-0 right-0 -scale-x-100" />
      <Corner className="bottom-0 left-0 -scale-y-100" />
      <Corner className="right-0 bottom-0 -scale-100" />
    </div>
  );
}
