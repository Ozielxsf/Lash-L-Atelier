import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { isSessionConfigured, sessionOptions, type SessionData } from "@/lib/session";

// Admin-only action; the /admin/ path exempts it from the public rate-limit check.
export async function POST() {
  if (isSessionConfigured()) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.destroy();
  }
  return NextResponse.json({ ok: true });
}
