/**
 * Renders icon.html to every icon the site needs. Run once after editing the
 * artwork:  PW=<path to playwright> node scripts/app-icon/render.mjs
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
const page = `file://${path.join(here, "icon.html")}`;

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
async function shot(query) {
  await tab.goto(page + query);
  await tab.waitForSelector("body[data-ready]");
  await tab.waitForTimeout(200);
  return tab.screenshot({ type: "png" });
}
const full = await shot("");
const safe = await shot("?safe=1");
const fav = await shot("?fav=1");
const admin = await shot("?admin=1");
const adminSafe = await shot("?admin=1&safe=1");
await browser.close();

const out = (size, buf, file) => sharp(buf).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toFile(path.join(root, file));
await Promise.all([
  out(256, fav, "src/app/icon.png"), // favicon / browser tab (Next serves it)
  out(180, full, "src/app/apple-icon.png"), // iPhone home screen
  out(192, full, "public/icons/icon-192.png"),
  out(512, full, "public/icons/icon-512.png"),
  out(512, safe, "public/icons/icon-maskable-512.png"), // Android shaped icons
  // The studio dashboard's own home-screen app (see app/admin/manifest.webmanifest)
  out(180, admin, "public/icons/admin-180.png"),
  out(192, admin, "public/icons/admin-192.png"),
  out(512, admin, "public/icons/admin-512.png"),
  out(512, adminSafe, "public/icons/admin-maskable-512.png"),
  out(1024, admin, "scripts/app-icon/preview-admin.png"),
  out(1024, full, "scripts/app-icon/preview-1024.png"),
  out(1024, fav, "scripts/app-icon/preview-favicon.png"),
]);
console.log("icons written");
