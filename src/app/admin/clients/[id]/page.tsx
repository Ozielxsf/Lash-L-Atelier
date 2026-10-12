import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell, { Panel } from "@/components/admin/AdminShell";
import AddNoteForm from "@/components/admin/clients/AddNoteForm";
import { DeleteClientButton, DeleteNoteButton } from "@/components/admin/clients/ClientDangerButtons";
import EditClientForm from "@/components/admin/clients/EditClientForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getClientRecord, noteServiceOptions, teamNames } from "@/lib/clients";
import { formatCurrency } from "@/lib/format";
import { formatAppointment, formatLongDate, studioYmd } from "@/lib/studio-time";

export const dynamic = "force-dynamic";

const SOURCE: Record<string, string> = { booking: "First booked online", walk_in: "Added as a walk-in", admin: "Added by the studio" };

/** One client's card: details, allergies up top, visit notes, bookings, privacy tools. */
export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ added?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { added } = await searchParams;
  const record = await getClientRecord(id);
  if (!record) notFound();
  const { client, notes, appointments } = record;
  const today = studioYmd(new Date());

  return (
    <AdminShell active="/admin/clients" title={client.name}>
      <p className="mt-2 text-sm">
        <Link href="/admin/clients" className="text-rouge underline underline-offset-4">← All clients</Link>
      </p>
      {added && (
        <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Client saved.
        </p>
      )}

      {/* At a glance — contact, and allergies where nobody can miss them. */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white/85 p-5 shadow-soft">
          <p className="text-sm text-ink-soft">{SOURCE[client.source]} · {formatLongDate(studioYmd(new Date(client.created_at)))}</p>
          <ul className="mt-3 space-y-1.5">
            {client.phone && (
              <li><a href={`tel:${client.phone}`} className="font-medium underline underline-offset-2">{client.phone}</a></li>
            )}
            {client.email && (
              <li><a href={`mailto:${client.email}`} className="break-all underline underline-offset-2">{client.email}</a></li>
            )}
            {client.birthday && <li className="text-sm">Birthday: {formatLongDate(client.birthday)}</li>}
            {!client.phone && !client.email && <li className="text-sm text-ink-soft">No contact details yet.</li>}
          </ul>
          {client.preferences && (
            <p className="mt-3 text-sm"><span className="font-medium">Prefers:</span> {client.preferences}</p>
          )}
        </div>
        <div
          className={
            client.allergies
              ? "rounded-2xl border border-rouge/30 bg-rouge/5 p-5"
              : "rounded-2xl border border-ink/10 bg-white/60 p-5"
          }
        >
          <h2 className="font-caps text-[0.7rem] font-semibold tracking-[0.24em] text-rouge uppercase">Allergies &amp; sensitivities</h2>
          <p className="mt-2 whitespace-pre-line">{client.allergies || <span className="text-sm text-ink-soft">None noted.</span>}</p>
        </div>
      </section>

      <Panel title="Add a visit note" description="What was done today and anything to remember for next time.">
        <AddNoteForm clientId={client.id} today={today} services={noteServiceOptions()} team={teamNames()} />
      </Panel>

      <Panel title={`Visit notes${notes.length ? ` (${notes.length})` : ""}`}>
        {notes.length === 0 ? (
          <p className="text-sm text-ink-soft">No notes yet.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {notes.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight">
                    {formatLongDate(n.visit_date)}
                    {n.service && <span className="text-ink-soft"> · {n.service}</span>}
                  </p>
                  <p className="mt-1 whitespace-pre-line">{n.body}</p>
                  {n.author && <p className="mt-1 text-sm text-ink-soft">— {n.author}</p>}
                </div>
                <DeleteNoteButton id={n.id} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Bookings" description="Online requests and appointments linked to this client.">
        {appointments.length === 0 ? (
          <p className="text-sm text-ink-soft">No online bookings.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {appointments.map((a) => (
              <li key={a.id} className="py-3 text-sm">
                <span className="font-medium">{formatAppointment(a.starts_at)}</span>
                <span className="text-ink-soft"> · {a.service_name}{a.price_dollars !== null && ` · ${formatCurrency(a.price_dollars)}`} · {a.status.replace("_", "-")}</span>
                {a.notes && <span className="block text-ink-soft italic">“{a.notes}”</span>}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Details" description="Contact details, allergies, preferences and general notes.">
        <EditClientForm client={client} />
      </Panel>

      <Panel
        title="Privacy"
        description="If this client asks for a copy of their information, or asks you to delete it."
      >
        <div className="flex flex-wrap items-start gap-4">
          <a
            href={`/admin/clients/${client.id}/export`}
            className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm font-medium hover:border-rouge hover:text-rouge"
          >
            Download their record
          </a>
          <DeleteClientButton id={client.id} name={client.name} />
        </div>
      </Panel>
    </AdminShell>
  );
}
