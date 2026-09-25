/**
 * Escape user input before it goes into an HTML string.
 *
 * Build Standards §1. Any API route that builds an HTML email or notification
 * must run every user-supplied field through this before interpolation.
 * Raw template-literal interpolation is an HTML injection hole: a visitor can
 * put `<script>` or a disguised link in a form field and it renders live in
 * whoever opens the notification.
 *
 * This lives in lib/ rather than being redeclared per route on purpose —
 * Build Standards §5. In the Wallink Systems site itself it was copy-pasted
 * into both the contact and review routes, which is exactly the drift the
 * standard exists to prevent: fix one copy, forget the other, and half your
 * routes are still vulnerable.
 *
 * Order matters: `&` must be replaced first, or the ampersands introduced by
 * the later replacements get double-escaped.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
