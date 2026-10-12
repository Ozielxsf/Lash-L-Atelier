import { isAdmin } from "@/lib/admin-auth";
import { allClientsForExport } from "@/lib/clients";
import { studioYmd } from "@/lib/studio-time";

export const dynamic = "force-dynamic";

/** A cell, quoted, and defused: a leading = + - @ would run as a formula in Excel/Sheets. */
function cell(value: string | null): string {
  let v = value ?? "";
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return `"${v.replace(/"/g, '""')}"`;
}

/** Every client card as a spreadsheet (CSV) — the owner's own backup. Admin only. */
export async function GET() {
  if (!(await isAdmin())) return new Response("Not signed in", { status: 401 });
  const clients = await allClientsForExport();
  const header = ["Name", "Phone", "Email", "Birthday", "Allergies & sensitivities", "Preferences", "Notes", "Added", "Source"];
  const rows = clients.map((c) =>
    [c.name, c.phone, c.email, c.birthday, c.allergies, c.preferences, c.notes, studioYmd(new Date(c.created_at)), c.source]
      .map(cell)
      .join(","),
  );
  // BOM so Excel opens accented names correctly.
  const csv = "﻿" + [header.map(cell).join(","), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="lash-latelier-clients-${studioYmd(new Date())}.csv"`,
      "cache-control": "no-store",
    },
  });
}
