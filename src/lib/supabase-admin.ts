import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client, using the service-role key.
 *
 * NEVER import this into a client component. The service-role key bypasses
 * Row-Level Security; if it reaches the browser, every row in the database is
 * readable and writable by anyone who opens dev tools. (`server-only` makes
 * that a build error.)
 *
 * Lazy on purpose. The Wallink starter threw at import when the env vars were
 * missing — fine for a site that can't work without its database, wrong for
 * this one: the public site must keep building and serving with no database
 * at all, and online booking simply reads as "off". So callers ask for the
 * client and handle `null`.
 *
 * Build Standards §4: every table gets a TypeScript type here the same day it
 * is created (see supabase/migrations/).
 */

let client: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (client === undefined) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const schema = process.env.SUPABASE_SCHEMA?.trim() || undefined;
    client =
      url && key
        ? // Cast: a runtime-chosen schema widens supabase-js's schema generic to
          // `string`. Row types are enforced by the typed selects below instead.
          (createClient(url, key, {
            auth: { persistSession: false },
            ...(schema ? { db: { schema } } : {}),
          }) as unknown as SupabaseClient)
        : null;
  }
  return client;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/* ── Table types ─────────────────────────────────────────────────────────── */

/** Contact-form submissions (baseline; unused until a contact form exists). */
export type Lead = {
  id: string;
  created_at: string;
  name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "new" | "reviewed" | "in_progress" | "closed";
};

/** Basic page-view analytics (baseline). */
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

/** One row per weekday; 0 = Sunday. Times are "HH:MM:SS" in studio local time. */
export type BusinessHours = {
  weekday: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
  updated_at: string;
};

export type TimeOff = {
  id: string;
  created_at: string;
  starts_on: string; // YYYY-MM-DD, inclusive
  ends_on: string; // YYYY-MM-DD, inclusive
  reason: string | null;
};

export const APPOINTMENT_STATUSES = ["requested", "confirmed", "declined", "cancelled", "completed", "no_show"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Statuses that hold a slot — the same set the DB overlap constraint uses. */
export const ACTIVE_STATUSES: AppointmentStatus[] = ["requested", "confirmed"];

export type Appointment = {
  id: string;
  created_at: string;
  updated_at: string;
  service_id: string;
  service_name: string;
  duration_minutes: number;
  price_dollars: number | null;
  add_ons: string[];
  starts_at: string;
  ends_at: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  notes: string | null;
  is_new_client: boolean;
  status: AppointmentStatus;
  source: "online" | "preview" | "admin";
};

/** Column list, as one literal so supabase-js keeps the row type (Wallink §9 note). */
export const APPOINTMENT_COLUMNS =
  "id, created_at, updated_at, service_id, service_name, duration_minutes, price_dollars, add_ons, starts_at, ends_at, client_name, client_phone, client_email, notes, is_new_client, status, source" as const;
