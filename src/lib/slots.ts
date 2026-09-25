import { studioTimeToDate } from "@/lib/studio-time";

/**
 * Pure slot calculation — no database, no clock — so it can be tested and
 * reasoned about on its own. lib/availability.ts feeds it real data.
 */

export type Busy = { start: number; end: number }; // epoch ms

export type SlotInput = {
  ymd: string; // studio calendar day
  openMinutes: number; // studio-local, e.g. 600 = 10:00
  closeMinutes: number;
  duration: number; // minutes the service takes
  step: number; // minutes between start times
  busy: Busy[]; // existing live bookings
  earliest: number; // epoch ms — nothing may start before this (lead time)
};

export type Slot = { start: string; minutes: number }; // ISO instant + studio-local minutes

export function computeSlots({ ymd, openMinutes, closeMinutes, duration, step, busy, earliest }: SlotInput): Slot[] {
  const slots: Slot[] = [];
  // The appointment must END by closing time, not merely start before it.
  for (let m = openMinutes; m + duration <= closeMinutes; m += step) {
    const start = studioTimeToDate(ymd, m).getTime();
    const end = start + duration * 60_000;
    if (start < earliest) continue;
    if (busy.some((b) => start < b.end && end > b.start)) continue;
    slots.push({ start: new Date(start).toISOString(), minutes: m });
  }
  return slots;
}
