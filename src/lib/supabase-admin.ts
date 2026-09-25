import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client, using the service-role key.
 *
 * NEVER import this into a client component. The service-role key bypasses
 * Row-Level Security; if it reaches the browser, every row in the database is
 * readable and writable by anyone who opens dev tools.
 *
 * Build Standards §4: every table gets a TypeScript type here the same day it
 * is created in Supabase. Untyped queries return `any`, which silently defeats
 * TypeScript and lets a column-name typo ship to production.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
/**
 * Optional. Which Postgres schema this site's tables live in — defaults to
 * "public". Set SUPABASE_SCHEMA when a site shares a Supabase project with
 * others, each isolated in its own schema.
 */
const schema = process.env.SUPABASE_SCHEMA?.trim() || undefined;

if (!url || !key) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false },
  ...(schema ? { db: { schema } } : {}),
});

/* ── Table types ─────────────────────────────────────────────────────────────
   These three ship with every site. Add a type here for every new table, and
   add the matching SQL to supabase/schema.sql so the two never drift. */

/** Contact-form submissions. */
export type Lead = {
  id: string;
  created_at: string;
  name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  /** What they're asking about — quote, booking, general enquiry. */
  subject: string | null;
  message: string;
  status: "new" | "reviewed" | "in_progress" | "closed";
};

/** Basic page-view analytics. */
export type PageView = {
  id: string;
  created_at: string;
  path: string;
  session_id: string | null;
};

/** Key/value store for anything the owner can toggle from the admin panel. */
export type SiteSetting = {
  key: string;
  value: string;
  updated_at: string;
};
