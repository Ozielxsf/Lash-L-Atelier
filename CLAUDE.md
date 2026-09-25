# Lash L'Atelier — Wallink Systems build

> Read this first. It is the whole context a fresh session needs: who the
> client is, what's built, what's next, and every decision made so far and why.
> The Wallink studio standards live in the Wallink-Systems repo
> (`CLAUDE.md`, `docs/WALLINK_PRINCIPLES.md`, `docs/WALLINK_STACK.md`); this
> build follows them. Creative direction for this client: `docs/CREATIVE_DIRECTION.md`.

---

## The client

| | |
|---|---|
| **Business** | Lash L'Atelier *(lah-tell-yay)* — "A Parisian Inspired Aesthetics Studio" |
| **Trade** | Lash extensions, brows, facials, red light therapy (licensed estheticians) |
| **Owner** | *(name not yet supplied)* |
| **Where** | 26 Campbell Street, Hickory, PA 15312 (Washington County) |
| **Phone** | (724) 467-3479 |
| **Domain** | lashlatelier.com (printed on the brochure) — *client buys and owns it; never hold it on a Wallink account* |
| **Status** | **Paid client.** Phase 1 (public site) live on preview; phase 2 (booking + admin) built and switched **OFF** — client doesn't want it live yet |

**What this business actually needs from a website:** to turn a phone visitor
into a phone call. Almost everyone arrives on a phone (social, Google Maps, a
friend's text); they need to understand the lash styles, see honest prices,
trust the studio (no card on file, no dues, licensed), and tap to call — in
that order. Everything on the site is arranged around that.

---

## Roadmap

1. **Phase 1 — public site foundation** ✅ *(this build)*
   Home, full menu with prices, visit page, legal pages, SEO/AEO, brand system.
2. **Phase 2 — online booking + admin dashboard** ✅ *built, switched OFF.*
   The client doesn't want online booking live yet (Oziel, Sept 2026), so it
   ships dark behind a switch on the admin dashboard. See **Online booking**
   below. Service `id`s in `src/data/services.ts` are the appointment-type
   keys — don't rename them once booking is live.
   ⚠️ The house rule is **no card on file / no pre-charging**. Booking honours
   that — it takes no payment and no card. Don't add deposits unless the owner
   explicitly changes the rule.
3. **Phase 3 — online product ordering.** Square/Stripe hosted checkout only.
   `features.onlineShop`.

Each phase: re-run `python3 scripts/build-legal.py <wallink>/legal` with the
matching `KEEP_*` flags + processor list, and bump the effective date. The
privacy policy must describe what the site actually collects.

---

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind v4 (`@theme`
in `globals.css`) · Motion · Lenis · lucide-react · clsx + tailwind-merge.
Supabase / Resend / Upstash / Turnstile arrive with phase 2 (see `.env.example`).

Deploys are automatic from `main` once the Vercel project exists. **Never push
to `main` without the owner saying so** — that is a production deploy.

```bash
npm run dev          # local
npm run typecheck    # tsc --noEmit
npm run lint
npm run build
npm run prelaunch    # Wallink pre-launch checks (scripts/prelaunch.mjs)
```

---

## Where things live

```
src/config/
  site.config.ts      business facts (address, phone, hours=null, socials)
  features.config.ts  build-time flags for unbuilt roadmap (onlineShop)
  brand.config.ts     motion tokens (ease, durations, Lenis pace)
src/data/             ALL copy and prices (Build Standard §3)
  services.ts         MENU + RED_LIGHT — the single source for every price
  lash-styles.ts      the 4 looks; points at service ids, never retypes prices
  promises.ts         HOUSE_RULES + PROMISES + LOYALTY
  offers.ts           $25 welcome offer
  faqs.ts, atelier.ts, navigation.ts
src/lib/
  booking.ts          getBookingAction(enabled) — where every Book button goes
  booking-settings.ts the switch + booking settings (site_settings table)
  booking-access.ts   public / owner-preview / closed
  booking-readiness.ts the dashboard's "ready to go" checklist
  availability.ts     hours − days off − live bookings → open days & slots
  slots.ts            pure slot maths (unit-tested)
  studio-time.ts      America/New_York, DST-safe, no date library
  appointments.ts     the only module that writes/lists appointments
  booking-email.ts    every booking email (escapeHtml on all client input)
  admin-auth.ts, session.ts   iron-session admin sign-in; requireAdmin()
  turnstile.ts, verify-turnstile.ts   Wallink's Turnstile pair (fails CLOSED)
  format.ts           formatCurrency / formatPrice / telHref / directionsHref
  schema.ts           JSON-LD (BeautySalon, FAQPage, Breadcrumb) from data
  legal.ts            tiny markdown parser for content/legal/*.md
  escape-html.ts, rate-limit.ts   ← Wallink starter (§1 §2)
  supabase-admin.ts   LAZY client (null when unconfigured) + a type per table (§4)
src/app/(site)/        public pages (route group — URLs unchanged); /book lives here
src/app/admin/         /admin (Bookings + the switch), /admin/schedule, /admin/login, actions.ts
src/app/api/booking/   POST (create request), slots/ (GET open times)
src/components/
  booking/ BookingFlow, BookingProvider, BookingIcon
  admin/   AdminShell, BookingToggle, AppointmentList/Actions, Hours/TimeOff/Preferences forms
  brand/   Wordmark, Flourish, OrnateFrame, Awning, Sparkle (canvas)
  home/    Hero, HouseRules, Atelier, LashStyles + LashDiagram, MenuPreview,
           RedLight, Welcome, Visit
  layout/  SiteChrome, Header, MenuDrawer, Footer, MobileActionBar, PageHeader
  motion/  LenisProvider, Reveal
content/legal/        generated — edit scripts/build-legal.py, not these
public/brand/         hero-eiffel-{tall,wide}.webp, atelier-shopfront.webp, roses.webp (generated, Higgsfield);
                      seal.webp (client's own seal, 4K-upscaled)
supabase/migrations/  0001_baseline.sql (Wallink starter), 0002_booking.sql — apply in order
```

---

## Online booking (phase 2) — built, switched OFF

**How it works.** A client picks a service → a day → a time → their details
at `/book`, and submits a **request** (Oziel's call: *the studio approves*,
not instant booking). The owner confirms or declines it on `/admin`; the
client is emailed at each step. No card, no payment — ever (house rule).

**The switch** is the `online_booking_enabled` row in `site_settings`, flipped
from the **Bookings** dashboard. OFF (today): every Book button on the site
calls the studio, `/book` says "we take bookings by phone" and is `noindex`,
and the booking APIs refuse the public. ON: every Book button opens `/book`,
`/book` joins the sitemap and llms.txt. Flipping it calls
`revalidatePath("/", "layout")` so the static pages regenerate on their next
request — public pages stay static and fast.
- **Owner preview:** while it's OFF, the signed-in owner still sees the full
  flow at `/book` (with a "Preview" banner). Test requests are tagged
  `source = 'preview'` and show a **TEST** badge on the dashboard.
- **The switch won't turn on** (UI and server both) until the blocking
  checklist items pass: database connected, at least one open day in studio
  hours, Turnstile keys set. Email + Upstash are warnings, not blockers.
- **Fails safe:** no database / DB error / missing env → booking reads as OFF
  and the public site keeps working. `getSupabaseAdmin()` returns `null`
  rather than throwing (a change from the Wallink starter, on purpose).

**Correctness that matters:**
- Times are studio time (America/New_York), DST-safe, whatever the server's
  zone (`lib/studio-time.ts`; tested across both 2026 DST switches).
- A service must END by closing time; lead time and booking window apply.
- Double-booking is impossible: the app re-checks the slot on submit, and the
  database has an exclusion constraint (`appointments_no_overlap`) over live
  bookings — even two simultaneous submits can't both land.
- Studio hours are seeded **closed**. We never guess hours; the owner sets them.

**⚠️ Service lengths are ESTIMATES** (`duration` in `src/data/services.ts`):
classic set 2h, hybrid/volume 2.5h, mega 3h, fills 1–1.5h, brows 30–60m,
facials 45m–1h45. They drive the calendar, so **confirm them with the owner
before switching on.** Add-ons (eye/lip masks) are extras on an appointment,
not bookable alone. Red light therapy stays "call to plan" (priced per plan).

**Tested end-to-end (Sept 2026)** against the real migrations on local
Postgres 16 + PostgREST (Supabase's API layer): 32/32 checks — switch off →
tel links, sign-in, schedule, owner preview, a booking request, slot removal,
409 on overlap, confirm, switch on → every CTA → `/book`, switch off again.

**Supabase project: `Lash L'Atelier`** — ref `sgrwraogzdxhftkyaqhm`,
`https://sgrwraogzdxhftkyaqhm.supabase.co`, us-east-2, org *Ozielxsf's Org*.
Oziel chose a **dedicated project** (Wallink rule for paying clients; ~$10/mo
on the Pro org) and created it by hand after the MCP `create_project` call
timed out three times. Both migrations applied 25 Sept 2026 (RLS on all six
tables, switch seeded OFF, all days closed). Supabase's security advisor
reports only "RLS enabled, no policy" — intentional: nothing is reachable
from the browser; the server uses the service-role key.

### Go-live steps (in order)
1. ✅ Supabase project created, `0001_baseline` + `0002_booking` applied.
2. ✅ (partly, 25 Sept 2026) Vercel env set: `NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` (Production), `SESSION_SECRET`, `ADMIN_PASSWORD`
   (Oziel changed it himself). Verified live: sign-in form up, wrong
   passwords rejected, Supabase logs show the site's settings reads → 200.
   Still to add before go-live: Turnstile pair, Upstash, Resend + sender.
   (The Vercel MCP needed Oziel to reconnect the connector before it could
   write env vars — it 403'd until then. Supabase secret keys can never be
   read by a tool; the owner pastes that one into Vercel.)
2b. Remaining Vercel env vars: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
   `TURNSTILE_SECRET_KEY`, and — once the
   client's domain is verified in Resend — `RESEND_API_KEY` + `BOOKING_FROM_EMAIL`.
   Add **Upstash Redis** from the Vercel marketplace (sets `KV_REST_API_*`). Redeploy.
3. Sign in at `/admin` → Schedule: real hours, days off, alert email.
4. Confirm service lengths with the owner; update `duration` values.
5. Preview `/book` as admin; make a test request; confirm it; check emails.
6. When the client says go: flip the switch on the Bookings dashboard.

---

## Build Standards — required, not optional

1. **Escape user input before it enters HTML** — `escapeHtml()` in `src/lib/escape-html.ts`.
2. **Durable rate limiting** on every public route — `isRateLimited()`; Upstash must be connected.
3. **Content lives in `src/data/`**, typed, never inline in JSX.
4. **Every Supabase table gets a TypeScript type** the day it's created (`src/lib/supabase-admin.ts`).
5. **Shared logic lives in `src/lib/`.** Second use → extract.
6. **Security and legal are non-negotiable.** HTTPS, Cloudflare, RLS, Turnstile, secrets in env only, WCAG 2.1 AA, privacy/terms/accessibility pages.
7. **Background video must survive in-app browsers.** (No video on this site today. If one is added, copy `background-video.ts` from the Wallink starter first.)
8. **No loading screen may hold the page past the LCP budget.** (There is no loader — the hero's own entrance is the intro, and the street image is the LCP element, served with `priority`.)

---

## Client-specific decisions (and why)

Log every call here with its reason — without the reason, someone eventually "fixes" it back.

- **The wordmark is live type, not an image.** Great Vibes ("Lash") + Cinzel
  ("L'ATELIER") match the client's seal closely and stay razor-sharp at any
  size. The client's round seal (`public/brand/seal.webp`) is used as a seal —
  in the footer — not as a logo scaled up and down.
- **No stock imagery.** Everything is the client's own art (the seal) or
  painted for this site in their palette and motifs (hero, shopfront, roses).
- **Hero = generated Eiffel Tower painting, full-bleed (Oziel's call, Sept 2026).**
  The first hero (night sky with the flyer's street rising from the bottom
  third) was rejected — *"I don't like the hero background or scarcity of the
  hero itself… make it more Eiffel Tower."* Replaced with two text-free
  paintings generated on Higgsfield (`gpt_image_2_5`, 2k) in the client's
  palette: `hero-eiffel-tall.webp` (portrait: tower centred down the street)
  and `hero-eiffel-wide.webp` (landscape: tower right, open sky left),
  art-directed with `<picture>` on `min-aspect-ratio: 1/1`. On portrait
  screens the name sits in the sky and the actions on the lit street; a
  radial "pool of night" behind the name lets the spire tip fade instead of
  striking through the lettering — don't remove it.
- **Scroll performance rules (Sept 2026, after Oziel felt a "glitch lag"
  scrolling out of the hero).** Measured on a 4×-throttled phone, then fixed:
  the hero painting is static (no scale animation); nothing fixed or over
  the painting uses `backdrop-filter` (header, bottom bar, menu chips and
  hero buttons are solid, near-opaque); the sparkle canvas stamps
  pre-rendered sprites instead of building gradients per frame; the paper
  grain is a PNG tile, not an SVG `feTurbulence` filter; Lenis is off on
  touch devices (it doesn't smooth touch, so it was pure overhead) and uses
  its default `lerp` on desktop — a 1.15s duration ease felt like lag.
  Keep these; each one was a measured cost.
- **The link preview (OG/Twitter card) shows the shopfront** (Oziel's call,
  Sept 2026): wordmark on the left, the painted storefront with its hanging
  sign on the right. It's what people see when the link is texted or posted.
- **Every raster image replaced at high resolution (Sept 2026).** Oziel: the
  flyer crops looked "pixelated and blurry". The Visit arch is now
  `atelier-shopfront.webp` (1792×2240, generated — striped awning, lit
  arched windows, roses, and a hanging sign that reads exactly "Lash /
  L'ATELIER"; checked at full size before use). The menu-board roses are
  `roses.webp`, generated on a true transparent background so there's no
  glitter patch around them. The footer seal is the **client's real seal**,
  upscaled 4K (ByteDance upscaler on Higgsfield) and re-cut to a circle —
  upscaled, not redrawn, because it's their logo. `paris-street.webp` (the
  flyer crop) is retired. If the client supplies original art files later,
  the seal is the one to swap first.
- **Red light wording follows the brochure, not the menu board.** The menu
  board says "Acne Treatment", "Hair Loss Scalp Regeneration"; the brochure
  softened these to "support"/"reduction". A cosmetic studio making medical
  outcome claims online is an FTC health-claims risk, so the site uses the
  softer phrasing and always shows `RED_LIGHT_DISCLAIMER` beside it.
- **French names are decorative asides, never the only label.** "Les Cils",
  "La Carte" etc. are `aria-hidden` script flourishes; the English name is
  always the real heading, because that's what people search for and read.
  The lash-look nicknames (Le Naturel, Le Mélange, Le Volume, Le Grand Soir)
  are ours — the owner can rename them in `src/data/lash-styles.ts`.
- **Phone-first CTA.** Every "Book" button calls the studio today. A fixed
  bottom bar (Menu · Directions · Call to book) is always under the thumb on
  phones; it hides from `lg` up where the header carries the phone number.
- **No hours shown — "By appointment".** Hours weren't on any print piece.
  `siteConfig.hours` is `null`; set it and the footer, visit section, JSON-LD
  and llms.txt all pick it up. Never publish guessed hours.
- **"Call to book", not "Call or text".** We don't know the number takes texts.
- **Welcome offer redemption online = "mention this offer when you book".**
  Print says "present this brochure". ⚠️ Confirm with the owner.
- **House rules appear exactly twice** (ribbon under the hero, footer) plus in
  the promise cards — a third list in the visit section was cut as repetition.
- **Promise cards are a swipe row on phones** (four stacked arches were
  ~1,100px of scrolling), a grid from `sm` up. One set of markup either way.
  The row carries `data-lenis-prevent-horizontal` — without it, Lenis kills
  touch scrolling on nested scrollers.
- **The menu board's duplicated "Brows and other services" block** on the
  client's printed menu (it repeats the fills) is a print error and was not
  carried over.
- **Legal pages are generated** from the Wallink templates by
  `scripts/build-legal.py`: accounts/orders/payments/marketing blocks removed,
  processors limited to what's actually in use (Vercel, Cloudflare, Wallink),
  email references routed to phone/post because no public email exists yet.
  Arbitration block kept (Wallink default for consumer sites). Governing law:
  Pennsylvania, Washington County.

---

## Content still needed from the owner

- [ ] **Public email address** (then add to `siteConfig.email` and re-run build-legal with it)
- [ ] **Opening hours** (or confirm "by appointment only")
- [ ] **Instagram / Facebook / TikTok** URLs → `siteConfig.social` (feeds JSON-LD `sameAs`)
- [ ] **Legal business name** (LLC?) for the legal pages
- [ ] **High-resolution originals** of the flyer artwork / seal
- [ ] **Real photos** of the studio and of their lash work (a gallery section is the obvious next add once they exist — never stock)
- [ ] Confirm how the **$25 welcome offer** is redeemed online, and any conditions
- [ ] Owner's name / esthetician names, if they want a people section
- [ ] Confirm the domain is **lashlatelier.com** and who holds it
- [ ] **Real appointment lengths** for every service (booking uses estimates)
- [ ] **Opening hours** for online booking (entered in /admin/schedule)
- [ ] Which email should receive new-booking alerts

---

## Launch checklist

- [x] `npx tsc --noEmit` clean
- [x] `npm run build` clean
- [ ] `node scripts/prelaunch.mjs` — zero failures (see its output for current state)
- [ ] Vercel project created (Wallink team), Deployment Protection off for client preview
- [ ] Domain connected; Cloudflare live: DDoS + Bot Fight + leaked credentials
      (⚠️ Bot Fight Mode blocks AI answer engines — only disable it once every
      public form has Turnstile + Upstash; see Wallink CLAUDE.md AEO notes)
- [ ] `NEXT_PUBLIC_SITE_URL` correct in production
- [ ] WCAG AA contrast measured (tokens in `globals.css` carry measured ratios), keyboard nav, focus visible
- [ ] Privacy + Terms + Accessibility live, effective date = launch date
- [ ] Live URL opened inside Instagram, Facebook and TikTok on a real phone
- [ ] PageSpeed Insights on the live URL (mobile) — LCP < 2.5s
- [ ] Google Business Profile updated with the site URL; submit sitemap in Search Console
- [ ] Client walkthrough done, remaining balance collected
- [ ] Monthly plan starts
