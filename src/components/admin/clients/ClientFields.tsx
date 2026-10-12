import { inputClass, textareaClass } from "@/components/admin/FormStatus";
import type { Client } from "@/lib/supabase-admin";

/** The card's details. Plain inputs — no state — so it renders on the server too. */
export default function ClientFields({ client }: { client?: Client }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        Name <span className="sr-only">(required)</span>
        <input type="text" name="name" required minLength={2} maxLength={120} autoComplete="off" defaultValue={client?.name} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Phone
        <input type="tel" name="phone" maxLength={40} autoComplete="off" defaultValue={client?.phone ?? ""} placeholder="(724) 555-0123" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input type="email" name="email" maxLength={254} autoComplete="off" defaultValue={client?.email ?? ""} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Birthday
        <input type="date" name="birthday" defaultValue={client?.birthday ?? ""} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        Allergies &amp; sensitivities
        <textarea
          name="allergies"
          maxLength={2000}
          defaultValue={client?.allergies ?? ""}
          placeholder="e.g. Sensitive to cyanoacrylate adhesive · latex allergy · contact lenses"
          className={`${textareaClass} min-h-20`}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        Preferences
        <textarea
          name="preferences"
          maxLength={2000}
          defaultValue={client?.preferences ?? ""}
          placeholder="e.g. Hybrid, C-curl 11–13 mm, natural cat-eye · likes the eye mask"
          className={`${textareaClass} min-h-20`}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        General notes
        <textarea name="notes" maxLength={4000} defaultValue={client?.notes ?? ""} className={`${textareaClass} min-h-20`} />
      </label>
    </div>
  );
}
