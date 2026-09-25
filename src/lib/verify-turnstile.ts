import "server-only";

/**
 * Cloudflare Turnstile — the server half, and the half that actually matters.
 *
 * Rendering the widget proves nothing on its own. The browser is not the only
 * thing that can POST to an API route: an attacker skips the page entirely and
 * sends JSON straight at it. The challenge only counts once the token has been
 * checked with Cloudflare here.
 *
 * Deliberately a separate file from lib/turnstile.ts (the client hook), so the
 * bundle a browser downloads never references TURNSTILE_SECRET_KEY at all.
 * `server-only` makes importing this from a client component a build error
 * rather than a silent leak of a name into the client graph.
 */

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult = { ok: true } | { ok: false; error: string; status: number };

/**
 * @param token    the `turnstileToken` field from the request body
 * @param ip       the caller's IP, if known — Cloudflare cross-checks it
 */
export async function verifyTurnstile(token: unknown, ip?: string): Promise<TurnstileResult> {
  const response = typeof token === "string" ? token : "";
  if (!response) return { ok: false, error: "Missing security token", status: 400 };

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail CLOSED. An unset secret must never mean "let everything through" —
    // that turns a missing env var in Vercel into an open, unprotected form.
    console.error("TURNSTILE_SECRET_KEY is not set — rejecting submission");
    return { ok: false, error: "Security check unavailable", status: 503 };
  }

  try {
    const res = await fetch(SITEVERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response, ...(ip ? { remoteip: ip } : {}) }),
    });
    const data = (await res.json()) as { success?: boolean };
    if (!data.success) return { ok: false, error: "Security check failed", status: 400 };
    return { ok: true };
  } catch {
    // Cloudflare unreachable. Still fail closed — the alternative is that an
    // outage silently disables bot protection on every public form at once.
    return { ok: false, error: "Security check unavailable", status: 503 };
  }
}
