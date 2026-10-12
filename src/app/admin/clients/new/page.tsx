import Link from "next/link";
import AdminShell, { Panel } from "@/components/admin/AdminShell";
import NewClientForm from "@/components/admin/clients/NewClientForm";
import { requireAdmin } from "@/lib/admin-auth";
import { noteServiceOptions, teamNames } from "@/lib/clients";
import { studioYmd } from "@/lib/studio-time";

export const dynamic = "force-dynamic";

/** Walk-ins (and anyone else added by hand): the card plus today's visit, in one form. */
export default async function NewClientPage() {
  await requireAdmin();
  return (
    <AdminShell active="/admin/clients" title="Add a walk-in">
      <p className="mt-2 text-sm">
        <Link href="/admin/clients" className="text-rouge underline underline-offset-4">← All clients</Link>
      </p>
      <Panel title="New client">
        <NewClientForm today={studioYmd(new Date())} services={noteServiceOptions()} team={teamNames()} />
      </Panel>
    </AdminShell>
  );
}
