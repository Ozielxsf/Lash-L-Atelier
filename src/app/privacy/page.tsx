import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { getLegalDoc } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Lash L'Atelier collects, uses and protects information on lashlatelier.com.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  return <LegalDocument doc={await getLegalDoc("privacy")} french="Confidentialité" />;
}
