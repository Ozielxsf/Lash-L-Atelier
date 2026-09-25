# Lash L'Atelier — Creative Direction

*Per-client creative direction (WALLINK_SKILL_USAGE.md, step 3). Written from
the client's own print pieces — the flyer, the menu board, the tri-fold
brochure, the round seal and the postcard — before any design work began.*

---

## The idea: *un soir à Paris* — an evening walk to the atelier's door

Every piece the client has made tells the same story: a black night sky
dusted with pink glitter, warming toward the horizon; a Paris street of gas
lamps, café tables and roses; a striped awning; and hanging from a lamp post,
the Lash L'Atelier sign. The website doesn't reinvent that — it **walks into
it**. The page is paced like an evening stroll that ends at the studio door:

1. **The street at night** (hero) — sky, sparkle, their painted street rising from below.
2. **The house rules** — what's different here, said before anything else.
3. **The atelier** — what the word means; how they work.
4. **The lashes** — the core decision, *drawn* so it can be understood.
5. **The menu board** — under the awning, on blush paper, with prices.
6. **The red light** — the one place the rose glows.
7. **The welcome ticket** — a keepsake worth screenshotting.
8. **The door** — the address, the sign, the call.

## What it must never look like

- A generic "lash bar" template — beige, a stock close-up of an eye, a
  sans-serif logo and a "Book Now" button.
- Pink-and-black "glam" clip-art. The glitter here is fine dust and a few
  slow four-point glints, never a sparkle GIF.
- Busy. The print pieces are ornate; the site takes one ornament per moment
  (a flourish under a heading, a frame on the hero and the ticket, the awning
  once) and lets the rest breathe.

## Colour — lifted from the print, not invented

| Token | Hex | From | Role |
|---|---|---|---|
| noir | `#110A0F` | the night sky | dominant ground |
| papier | `#F7E6EC` | the menu-board paper | light sections |
| rose | `#F2A7C6` | the "Lash" script | accent on dark only |
| rouge | `#A8264F` | the roses | CTAs and accent on light |
| crème | `#F6EADF` | "L'ATELIER" lettering | text on dark |
| gaslight | `#E6BD78` | the lamps | sparingly: glints, one detail |

Dark ↔ blush alternation is the page's rhythm, as it is on the brochure
(black outer panels, blush inner panels). All text pairs are measured AA or
better — see comments in `globals.css`.

## Type

- **Great Vibes** — the "Lash" script and French asides. Closest free match to the seal.
- **Cinzel** — inscriptional capitals: "L'ATELIER", eyebrows, labels.
- **Cormorant Garamond** — the editorial voice: headings, prices, the address.
- **Jost** — body and UI. Geometric, Futura-descended — Parisian Art Deco without costume.

Prices and addresses use lining figures (`.nums-lining`); Cormorant's
old-style figures are lovely in prose and wobbly in a column.

## Brand devices (all in code, no images)

- **Flourish** — hairline · curls · diamond, under every heading.
- **Ornate frame** — double rule with notched corners, from the flyer border. Hero + welcome ticket only.
- **Awning** — black/crème stripes with a scalloped hem. Over the menu board and the phone menu.
- **Arch** — Parisian shop windows and the menu board's crown: promise cards, the lash map, the visit image.
- **Sparkle** — a seeded canvas of four-point glints over glitter dust; paused off-screen; still under reduced motion.

## Motion — "a slow evening"

One curve (`--ease-soir`, cubic-bezier(.22,.61,.19,1)), long soft
decelerations, Lenis tuned slow. The wordmark writes itself in once; sections
lift in once; the lash map draws its lashes when a style is chosen. Nothing
loops except the glints. `prefers-reduced-motion` → fades only, no smooth scroll.

## Voice

Warm, brief, a little French. English does the work; French is seasoning
(*Bienvenue, À bientôt, La Carte*) and is never the only label. Plain about
money: prices up front, no card on file, no dues.
