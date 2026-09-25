import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import Visit from "@/components/home/Visit";
import JsonLd from "@/components/seo/JsonLd";
import { fullAddress, siteConfig } from "@/config/site.config";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Visit — Hickory, PA",
  description: `Find Lash L'Atelier at ${fullAddress}. Call ${siteConfig.phone.display} to book lash extensions, brows, facials or red light therapy.`,
  alternates: { canonical: "/visit" },
};

export default function VisitPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Visit", path: "/visit" }])} />
      <PageHeader
        french="Nous Trouver"
        title="Visit the Atelier"
        intro="A little corner of Paris on Campbell Street in Hickory, Pennsylvania. Call to book — we'll have the lamps lit."
      />
      <div className="pt-16">
        <Visit number={null} />
      </div>
    </>
  );
}
