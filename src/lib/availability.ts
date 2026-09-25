import "server-only";

import { getBookingSettings } from "@/lib/booking-settings";
import { computeSlots, type Slot } from "@/lib/slots";
import { addDays, studioTimeToDate, studioYmd, timeToMinutes, weekdayOf } from "@/lib/studio-time";
import { ACTIVE_STATUSES, getSupabaseAdmin, type BusinessHours, type TimeOff } from "@/lib/supabase-admin";

/**
 * Availability = weekly hours − days off − existing live bookings − lead time.
 * The ONLY module that answers "can this time be booked?" — the public slot
 * picker, the booking API's final re-check and the admin readiness check all
 * go through here (Build Standard §5).
 */

export async function getBusinessHours(): Promise<BusinessHours[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("business_hours")
    .select("weekday, is_open, open_time, close_time, updated_at")
    .order("weekday");
  if (error) throw new Error(error.message);
  return (data ?? []) as BusinessHours[];
}

export async function getTimeOff(fromYmd: string, toYmd: string): Promise<TimeOff[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("time_off")
    .select("id, created_at, starts_on, ends_on, reason")
    .lte("starts_on", toYmd)
    .gte("ends_on", fromYmd)
    .order("starts_on");
  if (error) throw new Error(error.message);
  return (data ?? []) as TimeOff[];
}

const isOff = (ymd: string, off: TimeOff[]) => off.some((t) => t.starts_on <= ymd && ymd <= t.ends_on);

export type BookingDay = { ymd: string; open: boolean };

/** The calendar strip: every day in the booking window, open or not. */
export async function getBookingDays(): Promise<BookingDay[]> {
  const settings = await getBookingSettings();
  const hours = await getBusinessHours();
  const today = studioYmd(new Date(Date.now() + settings.leadHours * 3_600_000));
  const last = addDays(studioYmd(new Date()), settings.windowDays);
  const off = await getTimeOff(today, last);
  const days: BookingDay[] = [];
  for (let d = today; d <= last; d = addDays(d, 1)) {
    const h = hours.find((row) => row.weekday === weekdayOf(d));
    days.push({ ymd: d, open: Boolean(h?.is_open) && !isOff(d, off) });
  }
  return days;
}

/** Bookable start times for one service on one studio day. */
export async function getSlots(ymd: string, duration: number): Promise<Slot[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const settings = await getBookingSettings();

  const lastDay = addDays(studioYmd(new Date()), settings.windowDays);
  if (ymd > lastDay) return [];

  const hours = (await getBusinessHours()).find((h) => h.weekday === weekdayOf(ymd));
  if (!hours?.is_open) return [];
  if (isOff(ymd, await getTimeOff(ymd, ymd))) return [];

  const dayStart = studioTimeToDate(ymd, 0).toISOString();
  const dayEnd = studioTimeToDate(addDays(ymd, 1), 0).toISOString();
  const { data, error } = await db
    .from("appointments")
    .select("starts_at, ends_at")
    .in("status", ACTIVE_STATUSES)
    .lt("starts_at", dayEnd)
    .gt("ends_at", dayStart);
  if (error) throw new Error(error.message);

  return computeSlots({
    ymd,
    openMinutes: timeToMinutes(hours.open_time),
    closeMinutes: timeToMinutes(hours.close_time),
    duration,
    step: settings.slotMinutes,
    busy: (data ?? []).map((a: { starts_at: string; ends_at: string }) => ({
      start: new Date(a.starts_at).getTime(),
      end: new Date(a.ends_at).getTime(),
    })),
    earliest: Date.now() + settings.leadHours * 3_600_000,
  });
}
