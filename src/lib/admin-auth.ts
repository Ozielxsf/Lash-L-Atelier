import "server-only";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSessionConfigured, sessionOptions, type SessionData } from "@/lib/session";

/** True when the request carries a valid admin session. Never throws. */
export async function isAdmin(): Promise<boolean> {
  if (!isSessionConfigured()) return false;
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    return session.isAdmin === true;
  } catch {
    return false;
  }
}

/**
 * Call at the top of EVERY admin page and server action. Guard per page, not
 * in a layout — a layout guard is one config slip from silently not running
 * (Wallink Build Standards §9).
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
