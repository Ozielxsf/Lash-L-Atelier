"use server";

import { revalidatePath } from "next/cache";
import { setAppointmentStatus } from "@/lib/appointments";
import { requireAdmin } from "@/lib/admin-auth";
import { sendStatusUpdate } from "@/lib/booking-email";
import { getReadiness } from "@/lib/booking-readiness";
import { SETTING_KEYS, saveSetting } from "@/lib/booking-settings";
import { isValidYmd, timeToMinutes } from "@/lib/studio-time";
import { APPOINTMENT_STATUSES, getSupabaseAdmin, type AppointmentStatus } from "@/lib/supabase-admin";

/**
 * Every admin write. Each action calls requireAdmin() itself: a server action
 * is a public POST endpoint under the hood, so the page being guarded is not
 * enough on its own.
 */

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

/* ── The switch ─────────────────────────────────────────────────────────── */

export async function setOnlineBooking(enabled: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (enabled) {
    const missing = (await getReadiness()).filter((r) => r.blocking && !r.ok);
    if (missing.length) {
      return { ok: false, error: `Finish setup first: ${missing.map((m) => m.label.toLowerCase()).join(", ")}.` };
    }
  }
  try {
    await saveSetting(SETTING_KEYS.enabled, enabled ? "true" : "false");
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  // Every public page carries a Book button, so regenerate them all — plus the
  // sitemap and llms.txt, which mention booking.
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
  return { ok: true, message: enabled ? "Online booking is ON." : "Online booking is OFF." };
}

/* ── Appointments ───────────────────────────────────────────────────────── */

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<ActionResult> {
  await requireAdmin();
  if (!APPOINTMENT_STATUSES.includes(status)) return { ok: false, error: "Unknown status" };
  try {
    const appt = await setAppointmentStatus(id, status);
    await sendStatusUpdate(appt);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  revalidatePath("/admin");
  return { ok: true };
}

/* ── Schedule ───────────────────────────────────────────────────────────── */

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function saveBusinessHours(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "Database is not configured" };

  const rows = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    const isOpen = form.get(`open-${weekday}`) === "on";
    const open = String(form.get(`start-${weekday}`) ?? "10:00");
    const close = String(form.get(`end-${weekday}`) ?? "18:00");
    if (!TIME.test(open) || !TIME.test(close)) return { ok: false, error: "Times must look like 10:00." };
    if (isOpen && timeToMinutes(close) <= timeToMinutes(open)) {
      return { ok: false, error: "Closing time must be after opening time." };
    }
    rows.push({ weekday, is_open: isOpen, open_time: open, close_time: close, updated_at: new Date().toISOString() });
  }
  const { error } = await db.from("business_hours").upsert(rows, { onConflict: "weekday" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Hours saved." };
}

export async function addTimeOff(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "Database is not configured" };
  const starts = String(form.get("starts_on") ?? "");
  const ends = String(form.get("ends_on") || starts);
  const reason = String(form.get("reason") ?? "").trim().slice(0, 200) || null;
  if (!isValidYmd(starts) || !isValidYmd(ends)) return { ok: false, error: "Choose a date." };
  if (ends < starts) return { ok: false, error: "The last day can't be before the first." };
  const { error } = await db.from("time_off").insert({ starts_on: starts, ends_on: ends, reason });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Day off added." };
}

export async function deleteTimeOff(id: string): Promise<ActionResult> {
  await requireAdmin();
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "Database is not configured" };
  const { error } = await db.from("time_off").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function saveBookingPreferences(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const email = String(form.get("notification_email") ?? "").trim();
  const lead = Number(form.get("lead_hours"));
  const windowDays = Number(form.get("window_days"));
  const slot = Number(form.get("slot_minutes"));
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: "That email doesn't look right." };
  if (!Number.isInteger(lead) || lead < 0 || lead > 336) return { ok: false, error: "Notice must be 0–336 hours." };
  if (!Number.isInteger(windowDays) || windowDays < 1 || windowDays > 365) return { ok: false, error: "Booking window must be 1–365 days." };
  if (![10, 15, 20, 30, 60].includes(slot)) return { ok: false, error: "Pick a start-time interval from the list." };
  try {
    await Promise.all([
      saveSetting(SETTING_KEYS.notificationEmail, email),
      saveSetting(SETTING_KEYS.leadHours, String(lead)),
      saveSetting(SETTING_KEYS.windowDays, String(windowDays)),
      saveSetting(SETTING_KEYS.slotMinutes, String(slot)),
    ]);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Booking settings saved." };
}
