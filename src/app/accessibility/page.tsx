import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { getLegalDoc } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "Lash L'Atelier's commitment to an accessible website, and how to reach us about a barrier.",
  alternates: { canonical: "/accessibility" },
};

export default async function AccessibilityPage() {
  return <LegalDocument doc={await getLegalDoc("accessibility")} french="Accessibilité" />;
}
