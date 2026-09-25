import "server-only";

import { cache } from "react";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Booking settings live in the baseline `site_settings` key/value table so the
 * owner can change them from /admin without a deploy. The most important one
 * is `online_booking_enabled` — the switch on the dashboard.
 */

export const SETTING_KEYS = {
  enabled: "online_booking_enabled",
  notificationEmail: "booking_notification_email",
  leadHours: "booking_lead_hours",
  windowDays: "booking_window_days",
  slotMinutes: "booking_slot_minutes",
} as const;

export type BookingSettings = {
  /** True only when the database answered AND the switch is on. */
  enabled: boolean;
  notificationEmail: string;
  /** Minimum notice, in hours, before the earliest bookable slot. */
  leadHours: number;
  /** How many days ahead the calendar opens. */
  windowDays: number;
  /** Minutes between offered start times. */
  slotMinutes: number;
  /** Whether the settings were actually read from the database. */
  connected: boolean;
};

const DEFAULTS: BookingSettings = {
  enabled: false,
  notificationEmail: "",
  leadHours: 12,
  windowDays: 60,
  slotMinutes: 15,
  connected: false,
};

function toInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/**
 * Read once per request (React `cache`). Any failure — no env vars, database
 * down, table missing — reads as "booking off". The public site must never
 * break, or open a half-working booking form, because the database hiccupped.
 */
export const getBookingSettings = cache(async (): Promise<BookingSettings> => {
  const db = getSupabaseAdmin();
  if (!db) return DEFAULTS;
  const { data, error } = await db
    .from("site_settings")
    .select("key, value")
    .in("key", Object.values(SETTING_KEYS));
  if (error || !data) {
    if (error) console.error("booking settings read failed:", error.message);
    return DEFAULTS;
  }
  const map = Object.fromEntries(data.map((row: { key: string; value: string }) => [row.key, row.value]));
  return {
    enabled: map[SETTING_KEYS.enabled] === "true",
    notificationEmail: map[SETTING_KEYS.notificationEmail] ?? "",
    leadHours: toInt(map[SETTING_KEYS.leadHours], DEFAULTS.leadHours, 0, 24 * 14),
    windowDays: toInt(map[SETTING_KEYS.windowDays], DEFAULTS.windowDays, 1, 365),
    slotMinutes: toInt(map[SETTING_KEYS.slotMinutes], DEFAULTS.slotMinutes, 5, 120),
    connected: true,
  };
});

export async function isOnlineBookingEnabled(): Promise<boolean> {
  return (await getBookingSettings()).enabled;
}

export async function saveSetting(key: (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS], value: string) {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Database is not configured");
  const { error } = await db
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}
