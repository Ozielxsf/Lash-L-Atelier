"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Pages where the bottom bar stays out of the way entirely. */
const HIDDEN_ON = ["/book"];

/** Anything that brings up the on-screen keyboard. */
function isTypingField(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  if (el instanceof HTMLInputElement) {
    return !["button", "submit", "reset", "checkbox", "radio", "range", "color", "file", "image"].includes(el.type);
  }
  return (el as HTMLElement).isContentEditable === true;
}

/**
 * Decides when the fixed bottom bar is shown.
 *
 * Why it exists: on iPhone, while the keyboard is open — and for a moment
 * after it closes — Safari positions `position: fixed; bottom: 0` against a
 * viewport that still thinks the keyboard is there, so the bar floats up the
 * screen and lands on top of form fields (seen on /book, Oct 2026). So the
 * bar steps aside while a typing field has focus and returns shortly after,
 * once iOS has settled. It's also hidden on /book, where the form has its own
 * button and "Call to book" would only compete with it.
 */
export default function ActionBarVisibility({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const onFocusIn = (e: FocusEvent) => {
      if (isTypingField(e.target as Element)) {
        window.clearTimeout(timer);
        setTyping(true);
      }
    };
    const onFocusOut = () => {
      // Moving between fields fires focusout then focusin — wait, then check
      // what actually has focus, and give iOS time to restore the viewport.
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setTyping(isTypingField(document.activeElement)), 400);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const hidden = typing || HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <div
      aria-hidden={hidden || undefined}
      inert={hidden}
      className={cn("transition-opacity duration-200", hidden && "invisible opacity-0")}
    >
      {children}
    </div>
  );
}
