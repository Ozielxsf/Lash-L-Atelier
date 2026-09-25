"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MapPin, X } from "lucide-react";
import BookingIcon from "@/components/booking/BookingIcon";
import Awning from "@/components/brand/Awning";
import Sparkle from "@/components/brand/Sparkle";
import { lenisInstance } from "@/components/motion/lenis-instance";
import { NAV_LINKS } from "@/data/navigation";
import { siteConfig, fullAddress } from "@/config/site.config";
import { useBookingAction } from "@/components/booking/BookingProvider";
import { directionsHref } from "@/lib/format";
import { motionTokens } from "@/config/brand.config";

/**
 * The phone menu: stepping under the awning into the atelier.
 *
 * Accessible as a modal dialog — focus moves in on open, Tab is trapped,
 * Escape closes, and focus returns to the toggle. Page scroll is paused
 * (Lenis + overflow) so the page doesn't drift behind it.
 */
export default function MenuDrawer({
  open,
  onClose,
  returnFocusTo,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusTo: React.RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const booking = useBookingAction();

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const lenis = lenisInstance.get();
    lenis?.stop();
    root.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    // After the entrance begins, so the focus ring doesn't flash mid-flight.
    const t = window.setTimeout(() => focusables()[0]?.focus(), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const toggle = returnFocusTo.current;

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      root.style.overflow = "";
      lenis?.start();
      toggle?.focus();
    };
  }, [open, onClose, returnFocusTo]);

  const ease = motionTokens.ease;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="menu-drawer"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          data-lenis-prevent
          className="sky-glow fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          <Sparkle density={0.7} seed={21} />
          <motion.div
            initial={reduce ? false : { y: -70 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <Awning height={30} />
          </motion.div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-[58px] right-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-noir/70 text-creme backdrop-blur transition-colors hover:text-rose"
          >
            <X className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only">Close menu</span>
          </button>

          <nav aria-label="Main" className="relative flex flex-1 flex-col justify-center px-8 pt-10 pb-6">
            <ul className="space-y-2">
              {[{ href: "/", label: "Home", french: "Accueil" }, ...NAV_LINKS].map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.12 + i * 0.06, ease }}
                >
                  <Link href={link.href} onClick={onClose} className="group flex items-baseline gap-4 py-2">
                    <span className="font-display text-[2.6rem] leading-none font-medium text-creme transition-colors group-hover:text-rose">
                      {link.label}
                    </span>
                    <span aria-hidden="true" className="font-script text-2xl text-rose/70">
                      {link.french}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          <motion.div
            className="relative space-y-4 border-t border-line-dark px-8 pt-6 pb-[calc(1.75rem+env(safe-area-inset-bottom))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45, ease }}
          >
            <a
              href={booking.href}
              aria-label={booking.ariaLabel}
              className="flex min-h-14 items-center justify-center gap-3 rounded-full bg-rose text-[0.8rem] font-medium tracking-[0.2em] text-noir uppercase"
            >
              <BookingIcon online={booking.online} />
              {booking.online ? booking.label : `${booking.label} · ${siteConfig.phone.display}`}
            </a>
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="nums-lining flex items-start gap-3 text-sm leading-relaxed text-creme-muted"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden="true" />
              <span>
                {fullAddress}
                <span className="block text-rose">Get directions</span>
              </span>
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
