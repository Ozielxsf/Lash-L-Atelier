import "server-only";

import { MENU, RED_LIGHT } from "@/data/services";
import { TEAM } from "@/data/team";
import { isValidYmd, studioYmd } from "@/lib/studio-time";
import {
  APPOINTMENT_COLUMNS,
  ACTIVE_STATUSES,
  CLIENT_COLUMNS,
  CLIENT_NOTE_COLUMNS,
  getSupabaseAdmin,
  type Appointment,
  type Client,
  type ClientNote,
} from "@/lib/supabase-admin";

/**
 * Client records (migration 0004) — the only module that reads or writes
 * `clients` and `client_notes` (§5). Admin pages, the booking flow and the
 * exports all come through here.
 *
 * Health-adjacent data (allergies, sensitivities): every caller is behind
 * requireAdmin()/isAdmin(); nothing here is reachable from the public site.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Last 10 digits — the same rule as the generated `phone_digits` column. */
export function phoneDigits(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "").slice(-10);
  return digits || null;
}

function db() {
  const client = getSupabaseAdmin();
  if (!client) throw new Error("Database is not configured");
  return client;
}

/* ── Input ──────────────────────────────────────────────────────────────── */

export type ClientInput = {
  name: string;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  allergies: string | null;
  preferences: string | null;
  notes: string | null;
};

const text = (v: FormDataEntryValue | null, max: number) => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s || null;
};

/** Read and check the details form. Plain-words errors, like the booking form. */
export function parseClientForm(form: FormData): { ok: true; value: ClientInput } | { ok: false; error: string } {
  const value: ClientInput = {
    name: text(form.get("name"), 120) ?? "",
    phone: text(form.get("phone"), 40),
    email: text(form.get("email"), 254)?.toLowerCase() ?? null,
    birthday: text(form.get("birthday"), 10),
    allergies: text(form.get("allergies"), 2000),
    preferences: text(form.get("preferences"), 2000),
    notes: text(form.get("notes"), 4000),
  };
  if (value.name.length < 2) return { ok: false, error: "Please enter the client's name." };
  if (value.phone && (phoneDigits(value.phone)?.length ?? 0) < 10)
    return { ok: false, error: "That phone number looks short — use all 10 digits, or leave it blank." };
  if (value.email && !EMAIL.test(value.email)) return { ok: false, error: "That email doesn't look right." };
  if (value.birthday && !isValidYmd(value.birthday)) return { ok: false, error: "Please pick the birthday from the date picker." };
  return { ok: true, value };
}

/* ── Reads ──────────────────────────────────────────────────────────────── */

export type ClientSummary = Client & { lastVisit: string | null; visits: number };

/**
 * The client list, newest activity first. `query` matches name, email, or —
 * when it's mostly digits — phone. Small studio: one page of up to 500.
 */
export async function listClients(query = ""): Promise<ClientSummary[]> {
  // PostgREST filter syntax treats , ( ) as separators — strip them (and wildcards).
  const q = query.replace(/[,()%*\\]/g, " ").trim().slice(0, 80);
  let req = db().from("clients").select(CLIENT_COLUMNS).order("updated_at", { ascending: false }).limit(500);
  if (q) {
    const digits = q.replace(/\D/g, "");
    req =
      digits.length >= 3 && digits.length >= q.replace(/\s/g, "").length - 3
        ? req.ilike("phone_digits", `%${digits}%`)
        : req.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  }
  const { data, error } = await req;
  if (error) throw new Error(error.message);
  const clients = (data ?? []) as Client[];
  if (!clients.length) return [];

  // Visit counts / last visit: notes + completed-or-booked appointments.
  const ids = clients.map((c) => c.id);
  const [{ data: notes }, { data: appts }] = await Promise.all([
    db().from("client_notes").select("client_id, visit_date").in("client_id", ids),
    db()
      .from("appointments")
      .select("client_id, starts_at, status")
      .in("client_id", ids)
      .in("status", ["confirmed", "completed"]),
  ]);
  const stats = new Map<string, { last: string | null; visits: number }>();
  const bump = (id: string, ymd: string) => {
    const s = stats.get(id) ?? { last: null, visits: 0 };
    s.visits += 1;
    if (!s.last || ymd > s.last) s.last = ymd;
    stats.set(id, s);
  };
  for (const n of notes ?? []) bump(n.client_id as string, n.visit_date as string);
  for (const a of appts ?? []) bump(a.client_id as string, studioYmd(new Date(a.starts_at as string)));
  return clients.map((c) => ({ ...c, lastVisit: stats.get(c.id)?.last ?? null, visits: stats.get(c.id)?.visits ?? 0 }));
}

export type ClientRecord = { client: Client; notes: ClientNote[]; appointments: Appointment[] };

export async function getClientRecord(id: string): Promise<ClientRecord | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data: client, error } = await db().from("clients").select(CLIENT_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!client) return null;
  const [{ data: notes }, { data: appointments }] = await Promise.all([
    db()
      .from("client_notes")
      .select(CLIENT_NOTE_COLUMNS)
      .eq("client_id", id)
      .order("visit_date", { ascending: false })
      .order("created_at", { ascending: false }),
    db().from("appointments").select(APPOINTMENT_COLUMNS).eq("client_id", id).order("starts_at", { ascending: false }),
  ]);
  return {
    client: client as Client,
    notes: (notes ?? []) as ClientNote[],
    appointments: (appointments ?? []) as Appointment[],
  };
}

/** Everything, for the owner's own backup (CSV). */
export async function allClientsForExport(): Promise<Client[]> {
  const { data, error } = await db().from("clients").select(CLIENT_COLUMNS).order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
}

/* ── Writes ─────────────────────────────────────────────────────────────── */

type Saved = { ok: true; id: string } | { ok: false; error: string; existingId?: string };

async function findByPhone(phone: string | null): Promise<Client | null> {
  const digits = phoneDigits(phone);
  if (!digits) return null;
  const { data } = await db().from("clients").select(CLIENT_COLUMNS).eq("phone_digits", digits).maybeSingle();
  return (data as Client | null) ?? null;
}

export async function createClient(input: ClientInput, source: Client["source"]): Promise<Saved> {
  const existing = await findByPhone(input.phone);
  if (existing) {
    return { ok: false, error: `${existing.name} already has a card with that phone number.`, existingId: existing.id };
  }
  const { data, error } = await db()
    .from("clients")
    .insert({ ...input, source })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: "A client with that phone number already exists." };
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data.id as string };
}

export async function updateClient(id: string, input: ClientInput): Promise<Saved> {
  const existing = await findByPhone(input.phone);
  if (existing && existing.id !== id) {
    return { ok: false, error: `${existing.name} already has a card with that phone number.`, existingId: existing.id };
  }
  const { error } = await db()
    .from("clients")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.code === "23505" ? "Another client has that phone number." : error.message };
  return { ok: true, id };
}

export type NoteInput = { visitDate: string; service: string | null; body: string; author: string | null };

export async function addClientNote(clientId: string, note: NoteInput): Promise<void> {
  const { error } = await db().from("client_notes").insert({
    client_id: clientId,
    visit_date: note.visitDate,
    service: note.service,
    body: note.body,
    author: note.author,
  });
  if (error) throw new Error(error.message);
  // A new note is activity — float the client to the top of the list.
  await db().from("clients").update({ updated_at: new Date().toISOString() }).eq("id", clientId);
}

export async function deleteClientNote(noteId: string): Promise<string | null> {
  const { data, error } = await db().from("client_notes").delete().eq("id", noteId).select("client_id").maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.client_id as string | undefined) ?? null;
}

/**
 * A deletion request: the card, every note (cascade), and the client's past
 * bookings. Refused while they still hold an upcoming appointment — cancel
 * that first, so the calendar and the client stay in step.
 */
export async function deleteClient(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: active } = await db()
    .from("appointments")
    .select("id")
    .eq("client_id", id)
    .in("status", ACTIVE_STATUSES)
    .gte("ends_at", new Date().toISOString())
    .limit(1);
  if (active?.length) return { ok: false, error: "They have an upcoming appointment — cancel it on Bookings first." };
  const { error: apptError } = await db().from("appointments").delete().eq("client_id", id);
  if (apptError) return { ok: false, error: apptError.message };
  const { error } = await db().from("clients").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Called after every real booking request: attach it to the client's card,
 * creating the card on a first booking. Matches on phone, then email. Fills
 * in a missing email/phone but never overwrites what the studio has typed.
 * Never throws — a booking must not fail because of this.
 */
export async function linkAppointmentToClient(appt: Appointment): Promise<void> {
  if (appt.source === "preview") return; // owner's tests stay out of the client list
  try {
    let client = await findByPhone(appt.client_phone);
    if (!client && appt.client_email) {
      const { data } = await db()
        .from("clients")
        .select(CLIENT_COLUMNS)
        .eq("email", appt.client_email.toLowerCase())
        .limit(1)
        .maybeSingle();
      client = (data as Client | null) ?? null;
    }
    if (client) {
      const fill: Partial<Client> = {};
      if (!client.email && appt.client_email) fill.email = appt.client_email;
      if (!client.phone && appt.client_phone) fill.phone = appt.client_phone;
      await db()
        .from("clients")
        .update({ ...fill, updated_at: new Date().toISOString() })
        .eq("id", client.id);
    } else {
      const created = await createClient(
        {
          name: appt.client_name,
          phone: appt.client_phone,
          email: appt.client_email,
          birthday: null,
          allergies: null,
          preferences: null,
          notes: null,
        },
        "booking",
      );
      // Lost a race with a simultaneous booking from the same phone — use theirs.
      client = created.ok ? ({ id: created.id } as Client) : await findByPhone(appt.client_phone);
    }
    if (client) await db().from("appointments").update({ client_id: client.id }).eq("id", appt.id);
  } catch (err) {
    console.error("client link failed:", err);
  }
}

/* ── Form options ───────────────────────────────────────────────────────── */

/** Suggestions for a note's "Service" box: every menu item plus red light. */
export function noteServiceOptions(): string[] {
  return [
    ...MENU.filter((c) => c.booking === "service").flatMap((c) => c.services.map((s) => s.name.replace(/[“”]/g, '"'))),
    RED_LIGHT.title,
  ];
}

/** Who can sign a note — the team page is the staff list. */
export function teamNames(): string[] {
  return TEAM.map((m) => m.name);
}
