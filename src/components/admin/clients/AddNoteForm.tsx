"use client";

import { useActionState, useEffect, useRef } from "react";
import { addNoteAction } from "@/app/admin/clients/actions";
import FormStatus, { saveClass } from "@/components/admin/FormStatus";
import { useKeepFormSubmit } from "@/components/admin/clients/useKeepFormSubmit";
import VisitNoteFields from "@/components/admin/clients/VisitNoteFields";

export default function AddNoteForm({
  clientId,
  today,
  services,
  team,
}: {
  clientId: string;
  today: string;
  services: string[];
  team: string[];
}) {
  const [state, action, pending] = useActionState(addNoteAction.bind(null, clientId), null);
  const onSubmit = useKeepFormSubmit(action);
  const form = useRef<HTMLFormElement>(null);
  // Clear the note after a save (keeps the date / written-by for the next one).
  useEffect(() => {
    if (state?.ok) {
      const body = form.current?.elements.namedItem("note_body");
      if (body instanceof HTMLTextAreaElement) body.value = "";
    }
  }, [state]);
  return (
    <form ref={form} onSubmit={onSubmit} className="space-y-4">
      <VisitNoteFields today={today} services={services} team={team} required />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={saveClass}>
          {pending ? "Saving…" : "Save note"}
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
