import { cn } from "@/lib/utils";

/**
 * The black-and-crème striped awning with its scalloped hem — the shopfront
 * from the client's seal and menu board. Pure CSS (see `.awning` in
 * globals.css): no image, sharp at any width.
 */
export default function Awning({ className, height = 46 }: { className?: string; height?: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn("awning w-full", className)}
      style={{ "--awning-h": `${height}px` } as React.CSSProperties}
    />
  );
}
