import "server-only";

import type { SessionOptions } from "iron-session";

export interface SessionData {
  isAdmin?: boolean;
}

/** iron-session needs a secret of at least 32 characters. */
export function isSessionConfigured(): boolean {
  return (process.env.SESSION_SECRET?.length ?? 0) >= 32 && Boolean(process.env.ADMIN_PASSWORD);
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "",
  cookieName: "lash-atelier-admin",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
