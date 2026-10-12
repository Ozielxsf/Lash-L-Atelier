"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/app/admin/actions";
import { TEAM } from "@/data/team";
import { requireAdmin } from "@/lib/admin-auth";
import {
  addClientNote,
  createClient,
  deleteClient,
  deleteClientNote,
  parseClientForm,
  updateClient,
  type NoteInput,
} from "@/lib/clients";
import { isValidYmd, studioYmd } from "@/lib/studio-time";

/**
 * Client-record writes. Like every admin action, each one calls
 * requireAdmin() itself — a server action is a public POST endpoint.
 */

/** A duplicate phone points at the card that already has it. */
export type ClientActionResult = ActionResult | { ok: false; error: string; existingId: string };

/** The visit-note fields, shared by "Add note" and the walk-in form. Null = left blank. */
function readNote(form: FormData): { ok: true; value: NoteInput | null } | { ok: false; error: string } {
  const body = String(form.get("note_body") ?? "").trim().slice(0, 4000);
  if (!body) return { ok: true, value: null };
  const visitDate = String(form.get("visit_date") || studioYmd(new Date()));
  if (!isValidYmd(visitDate)) return { ok: false, error: "Please pick the visit date from the date picker." };
  if (visitDate > studioYmd(new Date())) return { ok: false, error: "A visit note can't be dated in the future." };
  const service = String(form.get("service") ?? "").trim().slice(0, 200) || null;
  const author = String(form.get("author") ?? "").trim();
  return {
    ok: true,
    value: { visitDate, service, body, author: TEAM.some((m) => m.name === author) ? author : null },
  };
}

/** Walk-in (or any hand-added) client, with an optional first visit note. */
export async function createClientAction(_prev: ClientActionResult | null, form: FormData): Promise<ClientActionResult> {
  await requireAdmin();
  const details = parseClientForm(form);
  if (!details.ok) return details;
  const note = readNote(form);
  if (!note.ok) return note;

  const saved = await createClient(details.value, "walk_in");
  if (!saved.ok) return saved.existingId ? { ok: false, error: saved.error, existingId: saved.existingId } : saved;
  if (note.value) {
    try {
      await addClientNote(saved.id, note.value);
    } catch (err) {
      console.error("first visit note failed:", err);
    }
  }
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${saved.id}?added=1`);
}

export async function updateClientAction(
  id: string,
  _prev: ClientActionResult | null,
  form: FormData,
): Promise<ClientActionResult> {
  await requireAdmin();
  const details = parseClientForm(form);
  if (!details.ok) return details;
  const saved = await updateClient(id, details.value);
  if (!saved.ok) return saved.existingId ? { ok: false, error: saved.error, existingId: saved.existingId } : saved;
  revalidatePath(`/admin/clients/${id}`);
  revalidatePath("/admin/clients");
  return { ok: true, message: "Details saved." };
}

export async function addNoteAction(clientId: string, _prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const note = readNote(form);
  if (!note.ok) return note;
  if (!note.value) return { ok: false, error: "Write the note first." };
  try {
    await addClientNote(clientId, note.value);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
  return { ok: true, message: "Note saved." };
}

export async function deleteNoteAction(noteId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const clientId = await deleteClientNote(noteId);
    if (clientId) revalidatePath(`/admin/clients/${clientId}`);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  return { ok: true };
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const result = await deleteClient(id);
  if (!result.ok) return result;
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  redirect("/admin/clients?deleted=1");
}
