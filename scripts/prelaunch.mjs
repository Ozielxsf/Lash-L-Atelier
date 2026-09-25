#!/usr/bin/env node
/**
 * Pre-launch checks for a Wallink client site.
 *
 *   node scripts/prelaunch.mjs
 *
 * Every check here maps to a line in the Build Standards pre-launch checklist.
 * The checklist has always existed; the problem was that it lived in a document
 * and got run from memory at 11pm on launch night. This runs in three seconds.
 *
 * WHAT IT CANNOT CHECK, and you still must do by hand:
 *   - Cloudflare active on the domain (DDoS + Bot Fight + leaked credentials)
 *   - Supabase RLS actually enabled (run the verify query in supabase/schema.sql)
 *   - Email sending domain verified in Resend — SPF/DKIM/DMARC
 *   - WCAG 2.1 AA: real contrast, keyboard nav, focus states
 *   - The live URL opened inside TikTok and Instagram (Build Standards §7)
 *
 * Exit code is 1 if any FAIL, so it can gate a deploy in CI.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const ROOT = process.cwd();
const pass = [], warn = [], fail = [];
const ok = (m) => pass.push(m);
const wrn = (m) => warn.push(m);
const bad = (m) => fail.push(m);

/** Every file under a directory matching a set of extensions. */
function walk(dir, exts, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry.startsWith(".")) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => entry.endsWith(e))) out.push(p);
  }
  return out;
}
const read = (p) => readFileSync(p, "utf8");
const rel = (p) => relative(ROOT, p);

/* ── §1 — user input escaped before it enters HTML ───────────────────────── */
// Scans src/lib as well as the API routes. An email template extracted to a
// shared module (as §5 asks) would otherwise walk straight out of this check's
// view — the opposite of what extracting it should do.
const routes = [
  ...walk(join(ROOT, "src/app/api"), [".ts"]),
  ...walk(join(ROOT, "src/lib"), [".ts"]),
];
// Must look like it actually assembles HTML. Naming the mail provider is not
// enough: a route whose error string says "check the Resend dashboard" builds
// no HTML, and flagging it just trains everyone to ignore this check.
// The trailing [\s/>] is load-bearing: without it a TypeScript generic such as
// querySelector<HTMLScriptElement> matches "<html" and every file using one
// gets reported as an injection risk.
const BUILDS_HTML =
  /html:\s*[`"']|<(?:html|body|table|div|span|p|a|strong|img|br|td|tr)[\s/>]/i;
// Comments don't ship. A usage example like `<div ref={ref} />` in a doc
// block is documentation, not an injection surface. Used by §1 and §7 —
// it was declared twice until the §1 scan started needing it too.
// is documentation, not an injection surface.
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const emailRoutes = routes.filter((p) => BUILDS_HTML.test(stripComments(read(p))));
for (const p of emailRoutes) {
  const src = read(p);
  if (/escapeHtml\s*\(/.test(src)) {
    if (/function\s+escapeHtml/.test(src)) {
      wrn(`§5 ${rel(p)} declares its own escapeHtml — import it from lib/ instead, or the copies drift`);
    } else ok(`§1 ${rel(p)} escapes user input`);
  } else {
    bad(`§1 ${rel(p)} builds HTML but never calls escapeHtml() — injection risk`);
  }
}
if (!emailRoutes.length) wrn("§1 no HTML-building API routes found — nothing to check");

/* ── §2 — durable rate limiting on every public route ────────────────────── */
const publicRoutes = routes.filter((p) => !/\/admin\//.test(p));
for (const p of publicRoutes) {
  const src = read(p);
  if (!/export\s+(async\s+)?function\s+(POST|PUT|PATCH|DELETE)/.test(src)) continue;
  if (/isRateLimited\s*\(/.test(src)) ok(`§2 ${rel(p)} is rate limited`);
  else bad(`§2 ${rel(p)} accepts writes with no rate limiting`);
}
const limiter = join(ROOT, "src/lib/rate-limit.ts");
if (existsSync(limiter)) {
  const src = read(limiter);
  if (/KV_REST_API_URL/.test(src)) ok("§2 rate limiter uses a durable store when configured");
  else bad("§2 rate limiter has no durable backend — in-memory only is worthless on serverless");
} else bad("§2 src/lib/rate-limit.ts is missing");

/* ── §5 — no logic duplicated across files ───────────────────────────────── */
const srcFiles = walk(join(ROOT, "src"), [".ts", ".tsx"]);
const helperNames = ["escapeHtml", "formatCurrency", "slugify", "getDashboardStats"];
for (const name of helperNames) {
  const decls = srcFiles.filter((p) => new RegExp(`function\\s+${name}\\b`).test(read(p)));
  if (decls.length > 1) bad(`§5 ${name}() is declared in ${decls.length} files — extract it to src/lib/`);
}

/* ── §6 — secrets never committed ────────────────────────────────────────── */
for (const f of [".env", ".env.local", ".env.production"]) {
  if (existsSync(join(ROOT, f))) {
    const ignored = existsSync(join(ROOT, ".gitignore")) && read(join(ROOT, ".gitignore")).includes(".env");
    if (ignored) ok(`§6 ${f} exists but is gitignored`);
    else bad(`§6 ${f} is NOT gitignored — secrets will be committed`);
  }
}
const SECRET = /(sk_live_|rk_live_|service_role|SUPABASE_SERVICE_ROLE_KEY\s*=\s*ey)/;
for (const p of srcFiles) {
  if (SECRET.test(read(p))) bad(`§6 ${rel(p)} looks like it contains a hardcoded secret`);
}

/* ── §6 — legal pages present ────────────────────────────────────────────── */
for (const [page, label] of [["privacy", "Privacy Policy"], ["terms", "Terms of Service"], ["accessibility", "Accessibility statement"]]) {
  // Route groups — (site)/privacy — don't change the URL, so look inside them too.
  const groups = existsSync(join(ROOT, "src/app"))
    ? readdirSync(join(ROOT, "src/app")).filter((d) => /^\(.+\)$/.test(d))
    : [];
  const found = ["", ...groups.map((g) => `${g}/`)].some((g) => existsSync(join(ROOT, `src/app/${g}${page}/page.tsx`)));
  if (found) ok(`§6 ${label} page exists`);
  else bad(`§6 ${label} page is missing — required before launch`);
}

/* ── §7 — background video must survive in-app browsers ──────────────────── */
/**
 * Comments are stripped before testing, and only .tsx is scanned. Without
 * that, the helper in lib/background-video.ts trips every check in this block:
 * its comments explain the rule by quoting `<video>`, so a naive search finds a
 * video element in the one file that exists to stop you rendering one.
 */
const withVideo = srcFiles
  .filter((p) => p.endsWith(".tsx"))
  .filter((p) => /<video[\s>]/.test(stripComments(read(p))));
for (const p of withVideo) {
  const src = stripComments(read(p));
  if (!/useBackgroundVideo|shouldRenderVideo|isInAppBrowser/.test(src))
    bad(`§7 ${rel(p)} renders <video> without the in-app browser guard — iOS will draw its own player over it`);
  else ok(`§7 ${rel(p)} guards its background video`);
  if (!/poster=/.test(src)) bad(`§7 ${rel(p)} has no poster image fallback`);
  for (const attr of ["autoPlay", "muted", "loop", "playsInline"]) {
    if (!new RegExp(attr).test(src)) bad(`§7 ${rel(p)} <video> is missing ${attr}`);
  }
}

/* ── §8 — a loading screen must not set a floor under LCP ────────────────── */
for (const p of srcFiles.filter((f) => /LoadingScreen/.test(f))) {
  const m = read(p).match(/MIN_MS\s*=\s*(\d+)/);
  if (m) {
    const ms = Number(m[1]);
    if (ms > 2500) bad(`§8 ${rel(p)} holds the page for ${ms}ms — over the 2.5s "good" LCP budget`);
    else if (ms > 1500) wrn(`§8 ${rel(p)} holds the page for ${ms}ms — inside budget, but it is pure LCP cost`);
    else ok(`§8 ${rel(p)} loader floor is ${ms}ms`);
  }
}

const layoutPath = join(ROOT, "src/app/layout.tsx");

/* ── SEO: an inherited canonical silently de-indexes every page ──────────── */
/**
 * Next.js metadata is INHERITED. A root layout with
 *   alternates: { canonical: "/" }
 * is correct for the homepage and a disaster for everything else: any page that
 * does not override it declares the homepage as its canonical, which tells
 * Google and Bing "I am a duplicate, don't index me."
 *
 * This shipped on wallinksystems.com and went unnoticed for months — /services,
 * /about and /portfolio were all pointing at the homepage. Nothing looks wrong
 * in the browser; you only see it in the rendered <head> or a Search Console
 * coverage report saying "Duplicate, Google chose different canonical".
 */
const layoutSrc = existsSync(layoutPath) ? read(layoutPath) : "";
const rootCanonical = /alternates\s*:\s*{[^}]*canonical/.test(layoutSrc);

/**
 * A page that tells robots not to index it has no canonical concern — a
 * canonical on a noindex page is ignored by every search engine, because you
 * have already said "do not index this". Private areas (admin, the client
 * portal) are exactly that, and flagging them is a false positive that trains
 * you to ignore this check.
 *
 * So: a page is exempt when it, or any layout above it, declares
 * `index: false`. That generalises the old hardcoded /admin/ skip to any
 * private area added later, without weakening the check for public pages.
 */
const NOINDEX = /robots\s*:\s*{[^}]*index\s*:\s*false/;
function isNoIndexed(pagePath) {
  if (NOINDEX.test(read(pagePath))) return true;
  let dir = dirname(pagePath);
  const appRoot = join(ROOT, "src/app");
  while (dir.startsWith(appRoot)) {
    const layout = join(dir, "layout.tsx");
    if (existsSync(layout) && NOINDEX.test(read(layout))) return true;
    if (dir === appRoot) break;
    dir = dirname(dir);
  }
  return false;
}

if (rootCanonical) {
  const pages = walk(join(ROOT, "src/app"), ["page.tsx"])
    .filter((p) => !/[\\/]admin[\\/]/.test(p))
    .filter((p) => !isNoIndexed(p))
    // The route root inherits the layout's canonical correctly — it IS "/".
    .filter((p) => rel(p) !== "src/app/page.tsx");
  const missing = pages.filter((p) => !/alternates/.test(read(p)));
  if (missing.length) {
    bad(
      `SEO ${missing.length} page(s) inherit the root layout's canonical and so declare themselves duplicates of the homepage: ` +
        missing.map(rel).join(", "),
    );
  } else ok("SEO every page declares its own canonical");
}

/* ── Portal: tenant isolation lives in exactly one file ──────────────────── */
/**
 * The portal tables have RLS on with NO policies, so every query runs as the
 * service role and the database will cheerfully hand back ANY client's rows.
 * Isolation is therefore enforced in application code — every read scoped by
 * client_id inside src/lib/portal-data.ts.
 *
 * That guarantee holds only while that really is the only file querying them.
 * One `.from("client_updates")` in a page component, one forgotten `.eq()`,
 * and a client sees another client's business. This check makes that
 * structural instead of a thing somebody has to remember.
 *
 * Storage is exempt: `.storage.from(bucket)` is not a table read, and the
 * upload route legitimately needs it.
 */
const PORTAL_TABLES = [
  "clients",
  "client_updates",
  "update_requests",
  "referrals",
  "client_assets",
  "portal_tokens",
];
const portalDataFile = "src/lib/portal-data.ts";
const portalAdminFile = "src/lib/portal-admin.ts";
// Two owners, two audiences:
//   portal-data.ts   scoped to ONE client, used by /portal
//   portal-admin.ts  reads ACROSS clients on purpose, used only by /admin
const PORTAL_OWNERS = [portalDataFile, portalAdminFile];
if (existsSync(join(ROOT, portalDataFile))) {
  const offenders = walk(join(ROOT, "src"), [".ts", ".tsx"])
    .filter((f) => !PORTAL_OWNERS.includes(rel(f)))
    .filter((f) => {
      const src = read(f);
      return PORTAL_TABLES.some((t) =>
        new RegExp(`\\.from\\(\\s*["'\`]${t}["'\`]`).test(src),
      );
    });
  if (offenders.length) {
    bad(
      `portal ${offenders.length} file(s) query a portal table outside ${PORTAL_OWNERS.join(" / ")}, ` +
        `so tenant isolation is no longer auditable in one place: ` +
        offenders.map(rel).join(", "),
    );
  } else ok(`portal every portal-table query goes through ${PORTAL_OWNERS.join(" / ")}`);

// portal-admin.ts deliberately returns other clients' rows, so reaching it
// from a client-facing page would hand one client the whole book. Only admin
// paths may import it.
if (existsSync(join(ROOT, portalAdminFile))) {
  const leaks = walk(join(ROOT, "src"), [".ts", ".tsx"])
    .filter((f) => rel(f) !== portalAdminFile)
    .filter((f) => /portal-admin/.test(read(f)) && /import[^;]*portal-admin/.test(read(f)))
    .filter((f) => {
      const r = rel(f);
      return !r.startsWith("src/app/admin/") && !r.startsWith("src/app/api/admin/");
    });
  if (leaks.length) {
    bad(
      `portal ${leaks.length} non-admin file(s) import ${portalAdminFile}, which reads ACROSS clients: ` +
        leaks.map(rel).join(", "),
    );
  } else ok(`portal ${portalAdminFile} is imported only from admin paths`);
}
}

/* ── SEO basics ──────────────────────────────────────────────────────────── */
for (const [f, label] of [["src/app/sitemap.ts", "sitemap"], ["src/app/robots.ts", "robots.txt"]]) {
  if (existsSync(join(ROOT, f))) ok(`SEO ${label} present`);
  else bad(`SEO ${label} missing`);
}
if (existsSync(layoutPath)) {
  const src = read(layoutPath);
  if (/metadataBase/.test(src)) ok("SEO metadataBase set");
  else wrn("SEO metadataBase not set — relative OG image URLs will not resolve");
  if (/lang=/.test(src)) ok("a11y <html lang> set");
  else bad("a11y <html> has no lang attribute");
}

/* ── report ──────────────────────────────────────────────────────────────── */
const line = "─".repeat(74);
console.log(`\n${line}\n  WALLINK PRE-LAUNCH CHECK\n${line}`);
for (const m of pass) console.log(`  PASS  ${m}`);
for (const m of warn) console.log(`  WARN  ${m}`);
for (const m of fail) console.log(`  FAIL  ${m}`);
console.log(line);
console.log(`  ${pass.length} passed · ${warn.length} warnings · ${fail.length} failures`);
console.log(`${line}\n`);
console.log("  Still to verify by hand — none of these can be checked from here:");
console.log("    · Cloudflare on the domain: DDoS + Bot Fight + leaked credentials");
console.log("    · Supabase RLS on every table (verify query in supabase/schema.sql)");
console.log("    · Resend sending domain verified — SPF/DKIM/DMARC");
console.log("    · WCAG 2.1 AA — contrast, keyboard nav, visible focus");
console.log("    · The live URL opened inside TikTok and Instagram\n");

process.exit(fail.length ? 1 : 0);
