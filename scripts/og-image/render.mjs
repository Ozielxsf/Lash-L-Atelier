/**
 * Renders og.html to the link-preview images (OG + Twitter, 1200×630 JPEG).
 * Run after editing the card:  PW=<path to playwright> node scripts/og-image/render.mjs
 * (uses the preinstalled Chromium; sharp comes from the project's Next install).
 */
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || "playwright");
const sharp = require("sharp");

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await tab.goto(`file://${path.join(here, "og.html")}`);
await tab.waitForSelector("body[data-ready]");
await tab.waitForTimeout(200);
const png = await tab.screenshot({ type: "png" });
await browser.close();

const jpg = await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
for (const name of ["opengraph-image.jpg", "twitter-image.jpg"]) {
  await sharp(jpg).toFile(path.join(root, "src/app", name));
  console.log(`wrote src/app/${name}`);
}
