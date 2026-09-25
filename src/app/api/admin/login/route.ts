import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";
import { isSessionConfigured, sessionOptions, type SessionData } from "@/lib/session";
import { isRateLimited } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";

// Brute-force protection: max 8 attempts per IP per 10 minutes.
const LIMIT = 8;
const WINDOW_MS = 10 * 60 * 1000;

// Constant-time comparison. Both sides are SHA-256'd first so the buffers are
// the same length whatever was typed.
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export async function POST(req: NextRequest) {
  if (await isRateLimited(`admin-login:${clientIp(req)}`, LIMIT, WINDOW_MS)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }
  if (!isSessionConfigured()) {
    console.error("Admin login unavailable: SESSION_SECRET (32+ chars) and ADMIN_PASSWORD must be set");
    return NextResponse.json({ error: "Admin sign-in isn't set up yet." }, { status: 503 });
  }

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof password !== "string" || !safeEqual(password, process.env.ADMIN_PASSWORD as string)) {
    return NextResponse.json({ error: "That password isn't right." }, { status: 401 });
  }

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.isAdmin = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
