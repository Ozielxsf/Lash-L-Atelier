"use client";

import { useActionState } from "react";
import { createClientAction } from "@/app/admin/clients/actions";
import ClientFields from "@/components/admin/clients/ClientFields";
import ClientResultStatus from "@/components/admin/clients/ClientResultStatus";
import VisitNoteFields from "@/components/admin/clients/VisitNoteFields";
import { saveClass } from "@/components/admin/FormStatus";
import { useKeepFormSubmit } from "@/components/admin/clients/useKeepFormSubmit";

/** The walk-in form: the card and (optionally) today's visit, in one save. */
export default function NewClientForm({ today, services, team }: { today: string; services: string[]; team: string[] }) {
  const [state, action, pending] = useActionState(createClientAction, null);
  const onSubmit = useKeepFormSubmit(action);
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <fieldset>
        <legend className="font-display text-2xl font-medium">Client details</legend>
        <p className="mt-1 mb-4 text-sm text-ink-soft">Only the name is required. A phone number lets their future online bookings join this card.</p>
        <ClientFields />
      </fieldset>
      <fieldset className="border-t border-ink/10 pt-6">
        <legend className="font-display text-2xl font-medium">Today’s visit <span className="text-base text-ink-soft">(optional)</span></legend>
        <p className="mt-1 mb-4 text-sm text-ink-soft">Leave the note empty to just save the card.</p>
        <VisitNoteFields today={today} services={services} team={team} />
      </fieldset>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={saveClass}>
          {pending ? "Saving…" : "Save client"}
        </button>
        <ClientResultStatus state={state} />
      </div>
    </form>
  );
}
