"use client";

import { useState, useTransition } from "react";
import { deleteClientAction, deleteNoteAction } from "@/app/admin/clients/actions";

export function DeleteNoteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this note? This can't be undone.")) return;
        start(async () => void (await deleteNoteAction(id)));
      }}
      className="min-h-10 rounded-full px-3 text-sm text-rouge hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}

/** A deletion request: the card, its notes and past bookings. Asks twice. */
export function DeleteClientButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const typed = window.prompt(
            `This permanently deletes ${name}'s card, every visit note and their past bookings.\n\nType DELETE to confirm.`,
          );
          if (typed?.trim().toUpperCase() !== "DELETE") return;
          start(async () => {
            const res = await deleteClientAction(id);
            if (res && !res.ok) setError(res.error);
          });
        }}
        className="min-h-11 rounded-full border border-rouge/40 px-5 text-sm font-medium text-rouge hover:bg-rouge hover:text-white disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete this client"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-rouge">{error}</p>}
    </div>
  );
}
