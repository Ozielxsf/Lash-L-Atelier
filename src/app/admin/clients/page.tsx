import Link from "next/link";
import AdminShell, { Panel } from "@/components/admin/AdminShell";
import { inputClass } from "@/components/admin/FormStatus";
import { requireAdmin } from "@/lib/admin-auth";
import { listClients } from "@/lib/clients";
import { isDatabaseConfigured } from "@/lib/supabase-admin";
import { formatLongDate } from "@/lib/studio-time";

export const dynamic = "force-dynamic";

/**
 * The client list. A card is made automatically on someone's first online
 * booking, or by hand for walk-ins ("Add a walk-in"). Search is by name,
 * email or phone.
 */
export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; deleted?: string }> }) {
  await requireAdmin();
  const { q = "", deleted } = await searchParams;

  if (!isDatabaseConfigured()) {
    return (
      <AdminShell active="/admin/clients" title="Clients">
        <Panel title="Not connected yet">
          <p className="text-sm text-ink-soft">The database isn’t connected, so there are no client records yet.</p>
        </Panel>
      </AdminShell>
    );
  }

  const clients = await listClients(q);

  return (
    <AdminShell active="/admin/clients" title="Clients">
      {deleted && (
        <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          The client and their records were deleted.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <form role="search" action="/admin/clients" className="flex flex-1 items-end gap-2">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Find a client
            <input type="search" name="q" defaultValue={q} placeholder="Name, phone or email" className={inputClass} />
          </label>
          <button type="submit" className="min-h-11 rounded-full border border-ink/20 px-5 text-sm font-medium hover:border-rouge hover:text-rouge">
            Search
          </button>
        </form>
        <Link
          href="/admin/clients/new"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-rouge px-6 text-[0.78rem] font-medium tracking-[0.18em] text-white uppercase hover:bg-rouge-deep"
        >
          + Add a walk-in
        </Link>
      </div>

      <Panel
        title={q ? `Results for “${q}”` : `All clients${clients.length ? ` (${clients.length})` : ""}`}
        description={q ? <Link href="/admin/clients" className="underline underline-offset-2">Show everyone</Link> : "Most recent activity first."}
      >
        {clients.length === 0 ? (
          <p className="text-sm text-ink-soft">
            {q ? "No one matches that." : "No clients yet. They appear here after their first online booking, or add a walk-in."}
          </p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {clients.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/clients/${c.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-rouge">
                  <span className="min-w-0">
                    <span className="block font-display text-xl leading-tight">
                      {c.name}
                      {c.allergies && (
                        <span className="ml-2 inline-block rounded-full bg-rouge/10 px-2 py-0.5 align-middle font-sans text-[0.68rem] font-medium tracking-wide text-rouge uppercase">
                          Allergy note
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-ink-soft">
                      {[c.phone, c.email].filter(Boolean).join(" · ") || "No contact details"}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm text-ink-soft">
                    {c.lastVisit ? <>Last visit<br />{formatLongDate(c.lastVisit)}</> : c.source === "walk_in" ? "Walk-in" : "New"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <p className="mt-6 text-sm text-ink-soft">
        {/* A file download from a route handler, not a page — a plain <a>, not <Link>. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/admin/clients/export" className="underline underline-offset-2 hover:text-rouge">Download all clients (spreadsheet)</a>
        {" "}— a backup copy for the studio. Keep it somewhere private.
      </p>
    </AdminShell>
  );
}
