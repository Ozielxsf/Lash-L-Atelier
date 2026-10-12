"use client";

import { useActionState } from "react";
import { updateClientAction } from "@/app/admin/clients/actions";
import ClientFields from "@/components/admin/clients/ClientFields";
import ClientResultStatus from "@/components/admin/clients/ClientResultStatus";
import { saveClass } from "@/components/admin/FormStatus";
import { useKeepFormSubmit } from "@/components/admin/clients/useKeepFormSubmit";
import type { Client } from "@/lib/supabase-admin";

export default function EditClientForm({ client }: { client: Client }) {
  const [state, action, pending] = useActionState(updateClientAction.bind(null, client.id), null);
  const onSubmit = useKeepFormSubmit(action);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ClientFields client={client} />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={saveClass}>
          {pending ? "Saving…" : "Save details"}
        </button>
        <ClientResultStatus state={state} />
      </div>
    </form>
  );
}
