"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import BookingIcon from "@/components/booking/BookingIcon";
import Wordmark from "@/components/brand/Wordmark";
import MenuDrawer from "@/components/layout/MenuDrawer";
import { NAV_LINKS } from "@/data/navigation";
import { siteConfig } from "@/config/site.config";
import { useBookingAction } from "@/components/booking/BookingProvider";
import { cn } from "@/lib/utils";

/**
 * Fixed header. Clear over the night-sky hero so the wordmark there is the
 * only brand element on screen, then settles into frosted noir once the
 * page moves. The small wordmark only fades in after that point — two logos
 * competing on one screen reads as a template.
 *
 * On a phone the menu button sits at the right edge, under the thumb.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Stable, so the drawer's focus-trap effect doesn't re-run on every render.
  const close = useCallback(() => setOpen(false), []);
  const booking = useBookingAction();
  // Only the home page has a hero wordmark to defer to.
  const pathname = usePathname();
  const showMark = scrolled || pathname !== "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-500 ease-soir",
          scrolled
            ? "bg-noir/95 shadow-[0_1px_0_rgb(246_234_223/0.08)]"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            aria-label={`${siteConfig.name} — home`}
            className={cn(
              "-ml-1 rounded-md px-1 pt-1 transition-opacity duration-500 ease-soir",
              showMark ? "opacity-100" : "opacity-0 focus-visible:opacity-100",
            )}
          >
            <Wordmark size="header" />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-[0.78rem] font-medium tracking-[0.2em] text-creme/85 uppercase transition-colors hover:text-rose"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={booking.href}
              aria-label={booking.ariaLabel}
              className="hidden min-h-11 items-center gap-2 rounded-full border border-rose/50 px-5 text-[0.75rem] font-medium tracking-[0.2em] text-rose uppercase transition-colors hover:bg-rose hover:text-noir lg:inline-flex"
            >
              <BookingIcon online={booking.online} className="h-3.5 w-3.5" />
              {booking.online ? booking.label : siteConfig.phone.display}
            </a>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="menu-drawer"
              className="-mr-2 inline-flex h-12 w-12 items-center justify-center rounded-full text-creme transition-colors hover:text-rose lg:hidden"
            >
              <Menu className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Open menu</span>
            </button>
          </div>
        </div>
      </header>
      <MenuDrawer open={open} onClose={close} returnFocusTo={toggleRef} />
    </>
  );
}
