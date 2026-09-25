import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { getLegalDoc } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of lashlatelier.com.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  return <LegalDocument doc={await getLegalDoc("terms")} french="Conditions" />;
}
