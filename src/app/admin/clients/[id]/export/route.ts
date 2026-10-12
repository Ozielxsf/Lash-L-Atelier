import { isAdmin } from "@/lib/admin-auth";
import { getClientRecord } from "@/lib/clients";

export const dynamic = "force-dynamic";

/**
 * One client's complete record (card, visit notes, bookings) as a JSON file —
 * for when a client asks for a copy of what the studio holds about them.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Not signed in", { status: 401 });
  const { id } = await params;
  const record = await getClientRecord(id);
  if (!record) return new Response("Not found", { status: 404 });
  const { client, notes, appointments } = record;
  const body = {
    exported: new Date().toISOString(),
    studio: "Lash L'Atelier",
    client: {
      name: client.name,
      phone: client.phone,
      email: client.email,
      birthday: client.birthday,
      allergies_and_sensitivities: client.allergies,
      preferences: client.preferences,
      notes: client.notes,
      added: client.created_at,
    },
    visit_notes: notes.map((n) => ({ date: n.visit_date, service: n.service, note: n.body, written_by: n.author })),
    bookings: appointments.map((a) => ({
      starts_at: a.starts_at,
      services: a.service_name,
      price_dollars: a.price_dollars,
      status: a.status,
      message: a.notes,
    })),
  };
  const slug = client.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "client";
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}-record.json"`,
      "cache-control": "no-store",
    },
  });
}
