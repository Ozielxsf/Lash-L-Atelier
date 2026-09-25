import "server-only";

import { getSlots } from "@/lib/availability";
import { addOnServices, resolveSelection } from "@/data/services";
import { isValidYmd, studioYmd } from "@/lib/studio-time";
import {
  APPOINTMENT_COLUMNS,
  ACTIVE_STATUSES,
  getSupabaseAdmin,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/supabase-admin";

/**
 * The only module that writes appointments or reads them in bulk. The public
 * booking API and the admin dashboard both come through here (§5).
 */

export type BookingInput = {
  /** One per menu section; validated by resolveSelection(). */
  serviceIds: string[];
  date: string; // studio YMD
  start: string; // ISO instant, one of the offered slots
  name: string;
  phone: string;
  email: string;
  notes: string;
  addOns: string[];
};

type Result<T> = { ok: true; value: T } | { ok: false; error: string; status: number };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Shape and sanity-check the raw request body. Says what's wrong, in plain words. */
export function parseBookingInput(body: unknown): Result<BookingInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const input: BookingInput = {
    serviceIds: Array.isArray(b.serviceIds)
      ? b.serviceIds.filter((x): x is string => typeof x === "string").slice(0, 6)
      : [],
    date: str(b.date, 10),
    start: str(b.start, 40),
    name: str(b.name, 120),
    phone: str(b.phone, 40),
    email: str(b.email, 254).toLowerCase(),
    notes: str(b.notes, 1000),
    addOns: Array.isArray(b.addOns) ? b.addOns.filter((x): x is string => typeof x === "string").slice(0, 10) : [],
  };
  const bad = (error: string) => ({ ok: false as const, error, status: 400 });
  if (!resolveSelection(input.serviceIds)) return bad("Please choose your services — one from each section.");
  if (!isValidYmd(input.date)) return bad("Please choose a date.");
  if (Number.isNaN(Date.parse(input.start)) || studioYmd(new Date(input.start)) !== input.date)
    return bad("Please choose a time.");
  if (input.name.length < 2) return bad("Please enter your name.");
  if (input.phone.replace(/\D/g, "").length < 10) return bad("Please enter a phone number we can reach you on.");
  if (!EMAIL.test(input.email)) return bad("Please enter a valid email address.");
  const allowedAddOns = new Set(addOnServices().map((s) => s.name));
  input.addOns = input.addOns.filter((a) => allowedAddOns.has(a));
  return { ok: true, value: input };
}

/**
 * Create a booking request. Re-checks the slot against live availability (the
 * page the visitor loaded may be minutes old), then inserts. The database's
 * overlap constraint is the last line of defence against two people taking
 * the same slot at the same instant.
 */
export async function createAppointment(
  input: BookingInput,
  source: Appointment["source"],
): Promise<Result<Appointment>> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "Online booking is unavailable right now.", status: 503 };
  const selection = resolveSelection(input.serviceIds)!;

  const slots = await getSlots(input.date, selection.duration);
  if (!slots.some((s) => s.start === new Date(input.start).toISOString())) {
    return { ok: false, error: "Sorry — that time was just taken. Please pick another.", status: 409 };
  }

  const startsAt = new Date(input.start);
  const endsAt = new Date(startsAt.getTime() + selection.duration * 60_000);
  const { data, error } = await db
    .from("appointments")
    .insert({
      service_id: selection.services[0].id,
      service_ids: selection.services.map((s) => s.id),
      service_name: selection.name,
      duration_minutes: selection.duration,
      price_dollars: selection.price,
      add_ons: input.addOns,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      client_name: input.name,
      client_phone: input.phone,
      client_email: input.email,
      notes: input.notes || null,
      status: "requested",
      source,
    })
    .select(APPOINTMENT_COLUMNS)
    .single();

  if (error) {
    // 23P01 = exclusion_violation: the overlap constraint caught a race.
    if (error.code === "23P01") {
      return { ok: false, error: "Sorry — that time was just taken. Please pick another.", status: 409 };
    }
    console.error("appointment insert failed:", error.message);
    return { ok: false, error: "We couldn't save your request. Please call us instead.", status: 500 };
  }
  return { ok: true, value: data as Appointment };
}

/* ── Admin reads & writes ───────────────────────────────────────────────── */

export async function listRequests(): Promise<Appointment[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("status", "requested")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

export async function listUpcoming(limit = 50): Promise<Appointment[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("status", "confirmed")
    .gte("ends_at", new Date(Date.now() - 12 * 3_600_000).toISOString())
    .order("starts_at")
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

export async function listRecent(limit = 20): Promise<Appointment[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)
    .not("status", "in", `(${ACTIVE_STATUSES.join(",")})`)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

/** Which moves the dashboard offers from each status. */
export const NEXT_STATUSES: Record<AppointmentStatus, AppointmentStatus[]> = {
  requested: ["confirmed", "declined"],
  confirmed: ["completed", "no_show", "cancelled"],
  declined: [],
  cancelled: [],
  completed: [],
  no_show: [],
};

export async function setAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Database is not configured");
  const { data: current, error: readError } = await db
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("id", id)
    .single();
  if (readError || !current) throw new Error("Appointment not found");
  if (!NEXT_STATUSES[(current as Appointment).status].includes(status)) {
    throw new Error(`Can't move a ${(current as Appointment).status} appointment to ${status}`);
  }
  const { data, error } = await db
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(APPOINTMENT_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data as Appointment;
}
