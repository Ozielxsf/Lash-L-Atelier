import Link from "next/link";
import FormStatus from "@/components/admin/FormStatus";
import type { ClientActionResult } from "@/app/admin/clients/actions";

/** FormStatus, plus a link to the existing card when the phone is a duplicate. */
export default function ClientResultStatus({ state }: { state: ClientActionResult | null }) {
  if (state && !state.ok && "existingId" in state) {
    return (
      <p role="alert" className="text-sm text-rouge">
        {state.error}{" "}
        <Link href={`/admin/clients/${state.existingId}`} className="font-medium underline underline-offset-2">
          Open their card
        </Link>
      </p>
    );
  }
  return <FormStatus state={state} />;
}
