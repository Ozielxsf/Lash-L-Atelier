import { cn } from "@/lib/utils";

/** The page gutter: 20px on a phone, widening with the screen, capped at 72rem. */
export default function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}
