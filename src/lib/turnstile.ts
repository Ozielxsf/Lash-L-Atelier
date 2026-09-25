"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Cloudflare Turnstile — the client half. Build Standards §6 requires it on
 * every public form.
 *
 * Extracted when the review form needed it too (§5: the second time a piece of
 * logic is needed, extract it — two copies always drift). The contact form had
 * the only working implementation; the review form had none at all, which meant
 * a public write route with rate limiting but no bot challenge.
 *
 * Usage:
 *
 *   const { token, ref, reset } = useTurnstile();
 *   ...
 *   <div ref={ref} />                 // the widget renders here
 *   if (!token) return;               // block submit until the challenge passes
 *   body: { ..., turnstileToken: token }
 *   reset();                          // after a failed submit — tokens are single-use
 *
 * The token MUST be verified server-side with verifyTurnstile() from
 * lib/verify-turnstile.ts. A rendered widget whose token is never checked is
 * decorative: an attacker skips the page and POSTs straight at the API.
 */

declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function useTurnstile() {
  const [token, setToken] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Reuse the tag if another form on the page already added it. Loading the
    // Turnstile script twice throws and the widget silently never renders,
    // which would block submission entirely.
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? document.createElement("script");
    let addedScript = false;

    const render = () => {
      if (!ref.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(ref.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };

    if (existing && window.turnstile) {
      render();
    } else {
      script.src = SCRIPT_SRC;
      script.async = true;
      script.addEventListener("load", render);
      if (!existing) {
        document.head.appendChild(script);
        addedScript = true;
      }
    }

    return () => {
      script.removeEventListener("load", render);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* already gone */
        }
      }
      if (addedScript && document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  /** Tokens are single-use. Call this after a rejected submit or the retry fails. */
  const reset = () => {
    setToken("");
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        /* widget gone */
      }
    }
  };

  return { token, ref, reset };
}
