/**
 * Studio-local time. Hickory, PA is America/New_York; the server (Vercel) runs
 * in UTC and a visitor's phone may be anywhere. Every booking calculation goes
 * through these helpers so "10:00" always means 10:00 at the studio —
 * including across daylight-saving changes — and never the server's clock.
 *
 * No date library: Intl does the zone math. Dates are passed around as
 * "YYYY-MM-DD" strings (studio calendar days) and times as minutes from
 * midnight, which keeps them free of any zone until the moment they become
 * real instants.
 */

export const STUDIO_TZ = "America/New_York";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: STUDIO_TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function zoneParts(date: Date) {
  const p: Record<string, string> = {};
  for (const { type, value } of partsFormatter.formatToParts(date)) p[type] = value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
  };
}

/** The zone's offset from UTC at an instant, in ms (e.g. EDT → −4h). */
function offsetMs(date: Date): number {
  const p = zoneParts(date);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - date.getTime();
}

/** A studio calendar day + minutes after midnight → the real instant. DST-safe. */
export function studioTimeToDate(ymd: string, minutes: number): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  const first = guess - offsetMs(new Date(guess));
  // Re-check once: if the guess straddled a DST switch the offset differs.
  const second = guess - offsetMs(new Date(first));
  return new Date(second);
}

/** The studio calendar day an instant falls on. */
export function studioYmd(date: Date): string {
  const p = zoneParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Minutes after studio midnight for an instant. */
export function studioMinutes(date: Date): number {
  const p = zoneParts(date);
  return p.hour * 60 + p.minute;
}

export function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, for a studio calendar day. */
export function weekdayOf(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isValidYmd(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** "10:00:00" / "10:00" → 600. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/* ── Display ──────────────────────────────────────────────────────────────── */

const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: STUDIO_TZ, hour: "numeric", minute: "2-digit" });
const longDateFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
const shortDayFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short" });
const shortMonthFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" });

/** "2:30 PM" at the studio. */
export function formatStudioTime(date: Date | string): string {
  return timeFmt.format(typeof date === "string" ? new Date(date) : date);
}

/** "10:00" (minutes) → "10:00 AM". */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function ymdToUtcDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** "Friday, October 3". */
export function formatLongDate(ymd: string): string {
  return longDateFmt.format(ymdToUtcDate(ymd));
}

/** { weekday: "Fri", day: "3", month: "Oct" } — for the date chips. */
export function dayParts(ymd: string) {
  const d = ymdToUtcDate(ymd);
  return { weekday: shortDayFmt.format(d), day: String(d.getUTCDate()), month: shortMonthFmt.format(d) };
}

/** "Friday, October 3 at 2:30 PM" for an appointment start. */
export function formatAppointment(startsAt: string | Date): string {
  const date = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
  return `${formatLongDate(studioYmd(date))} at ${formatStudioTime(date)}`;
}
