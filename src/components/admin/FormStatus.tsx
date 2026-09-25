import type { ActionResult } from "@/app/admin/actions";

export default function FormStatus({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-emerald-800" : "text-sm text-rouge"}>
      {state.ok ? state.message ?? "Saved." : state.error}
    </p>
  );
}

export const inputClass =
  "h-11 rounded-xl border border-ink/20 bg-white px-3 text-base outline-none focus:border-rouge disabled:opacity-40";
export const saveClass =
  "min-h-11 rounded-full bg-rouge px-6 text-[0.78rem] font-medium tracking-[0.18em] text-white uppercase hover:bg-rouge-deep disabled:opacity-60";
